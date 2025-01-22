import cv2
import numpy as np

# helper function to convert bounding boxes from normalized ymin, xmin, ymax, xmax ---> xmin, ymin, xmax, ymax
def format_boxes(bboxes, image_height, image_width):
    for box in bboxes:
        ymin = int(box[0] * image_height)
        xmin = int(box[1] * image_width)
        ymax = int(box[2] * image_height)
        xmax = int(box[3] * image_width)
        box[0], box[1], box[2], box[3] = xmin, ymin, xmax, ymax
    return bboxes

def draw_bbox(image, bboxes, info = False, show_label=True, classes=['Gun', 'Knife', 'Rifle']):
    num_classes = len(classes)
    image_h, image_w, _ = image.shape

    out_boxes, out_scores, out_classes, num_boxes = bboxes
    for i in range(num_boxes):
        if int(out_classes[i]) < 0 or int(out_classes[i]) > num_classes:
            continue
        
        coor = out_boxes[i]
        fontScale = 0.5
        score = out_scores[i]
        
        class_ind = int(out_classes[i])
        class_name = classes[class_ind]
        if class_name == 'Rifle':
            class_name = 'Gun'
                
        if class_name not in classes:
            continue
        else:
            bbox_color = (38, 14, 194)
            bbox_thick = int(0.6 * (image_h + image_w) / 600)
            c1, c2 =  (int(coor[0]), int(coor[1])), (int(coor[2]), int(coor[3]))
            cv2.rectangle(image, c1, c2, bbox_color, bbox_thick)

            if info:
                print("Object found: {}, Confidence: {:.4f}, BBox Coords (xmin, ymin, xmax, ymax): {}, {}, {}, {} ".format(class_name, score, coor[0], coor[1], coor[2], coor[3]))

            if show_label:
                bbox_mess = '%s: %.2f' % (class_name, score)
                t_size = cv2.getTextSize(bbox_mess, 0, fontScale, thickness=bbox_thick // 2)[0]
                c3 = (c1[0] + t_size[0], c1[1] - t_size[1] - 3)
                cv2.rectangle(image, c1, (int(c3[0]), int(c3[1])), bbox_color, -1) #filled

                cv2.putText(image, bbox_mess, (c1[0], int(np.float32(c1[1] - 2))), cv2.FONT_HERSHEY_SIMPLEX,fontScale, (0, 0, 0), bbox_thick // 2, lineType=cv2.LINE_AA)

    return image