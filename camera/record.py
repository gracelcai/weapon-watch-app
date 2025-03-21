import cv2
import shutil
import time
import numpy as np

# from cloud.encrypt_upload import encrypt_and_upload

def record(q):
    out = None
    while True:
        key = q.get()
        if type(key) == str:
            if key == "start":
                print("Recording started...")
            elif key == "stop":
                print("Recording stopped.")
                break
            elif key == "finish":
                source_file = "camera/footage.mp4"
                destination_file = "camera/ACTIVE_EVENT.mp4"

                time.sleep(3)

                shutil.copy(source_file, destination_file)
                # encrypt_and_upload("ACTIVE_EVENT.mp4", "ACTIVE_EVENT.mp4")
            
                print("ACTIVE EVENT OVER\n")
                print("SUCCESFULLY DOWNLOADED ACTIVE EVENT FOOTAGE\n")
                break
        elif isinstance(key, np.ndarray):
            if out is None:
                # Dynamically set resolution based on the first frame
                height, width, _ = key.shape
                fourcc = cv2.VideoWriter_fourcc(*'mp4v')
                out = cv2.VideoWriter('camera/footage.mp4', fourcc, 20.0, (width, height), True)
            if out:
                out.write(key)
                key = cv2.waitKey(1)
                if key == ord('q'):
                    break
            
    if out:
        out.release()