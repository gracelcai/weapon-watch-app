import numpy as np
import tensorflow as tf
import cv2
import utils as utils
import multiprocessing
import json
import time

def notify(q):
    while True:
        if not q.empty():
            key = q.get()
            if type(key) == str:
                break
            else:   
                with open('notify.json') as f:
                    data = json.load(f)
                data['detected'] = True
                with open('notify.json', 'w') as f:
                    json.dump(data, f)
                             
                for box in key:
                    print(box)
                    
                with open('record.json') as f:
                    data = json.load(f)
                data['confirmed'] = True
                with open('record.json', 'w') as f:
                    json.dump(data, f)

def record(q):
    while True:
        if not q.empty():
            key = q.get()
            if key == "stop":
                break
            else:
                print(key)

def detect(notify_q, record_q):
    cap = cv2.VideoCapture("videos/rifle2.MOV")
    
    path = 'detectionmodel'
    detect_weapon = tf.saved_model.load(path)
    
    # start_time = time.time()
    # frame_count = 0
    recording = False
    while(True):
        if not recording:
            with open('record.json') as f:
                data = json.load(f)
            
            if data['confirmed'] == True:
                record_q.put("active event confirmed: recording started")
                recording = True
                
        _, frame = cap.read()
            
        image_data = cv2.resize(frame, (608, 608))
        image_data = image_data / 255.
        image_data = image_data[np.newaxis, ...].astype(np.float32)

        infer_weapon = detect_weapon.signatures['serving_default']

        batch_data = tf.constant(image_data)
        pred_bbox = infer_weapon(batch_data)

        for key, value in pred_bbox.items():
            boxes = value[:, :, 0:4]
            pred_conf = value[:, :, 4:]

        boxes, scores, classes, valid_detections = tf.image.combined_non_max_suppression(
            boxes=tf.reshape(boxes, (tf.shape(boxes)[0], -1, 1, 4)),
            scores=tf.reshape(
                pred_conf, (tf.shape(pred_conf)[0], -1, tf.shape(pred_conf)[-1])),
            max_output_size_per_class=50,
            max_total_size=50,
            iou_threshold=0.5,
            score_threshold=0.3
        )
        valid_detections = valid_detections.numpy()[0]
            
        if valid_detections:
            original_h, original_w, _ = frame.shape
            bboxes = utils.format_boxes(boxes.numpy()[0][:valid_detections], original_h, original_w)

            notify_q.put(bboxes)
            
            pred_bbox = [bboxes, scores.numpy()[0], classes.numpy()[0], valid_detections]
            
            frame = utils.draw_bbox(frame, pred_bbox, info=False)
        
        cv2.imshow('Footage', frame)
        
        key = cv2.waitKey(1)
        if key == ord('q'):
            notify_q.put("stop")
            record_q.put("stop")
            break
            
        # frame_count += 1
        # print("FPS: ", frame_count / (time.time() - start_time), end='\r')
                     
    cap.release()
    cv2.destroyAllWindows()
    
if __name__ == "__main__":        
    with open('notify.json') as f:
        data = json.load(f)
    data['detected'] = False
    with open('notify.json', 'w') as f:
        json.dump(data, f)
        
    with open('record.json') as f:
        data = json.load(f)
    data['confirmed'] = False
    with open('record.json', 'w') as f:
        json.dump(data, f)
    
    notify_q = multiprocessing.Queue()
    record_q = multiprocessing.Queue()
    
    notify_p = multiprocessing.Process(target=notify, args=(notify_q,))
    notify_p.start()
    
    record_p = multiprocessing.Process(target=record, args=(record_q,))
    record_p.start()
    
    detect(notify_q, record_q)
    
    notify_q.close()
    record_q.close()
    
    notify_q.join_thread()
    record_q.join_thread()
    
    notify_p.join()
    record_p.join()