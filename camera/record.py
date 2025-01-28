import cv2 # type: ignore

def record(q):
    while True:
        if not q.empty():
            key = q.get()
            if key == "stop":
                break
            else:
                print(key)
                
                cap = cv2.VideoCapture('rtsp://rtspstream:oG2yLaie9XWG-LBgjEoUs@zephyr.rtsp.stream/movie')
                if(cap.isOpened)==False:
                    print("Error while reading the file")
                    
                fourcc = cv2.VideoWriter_fourcc(*'MP42')
                out = cv2.VideoWriter('footage.mp4', fourcc, 20.0, (720, 480), True)
                
                while(True):
                    ret,photo=cap.read()
                    out.write(photo)
                    key = cv2.waitKey(1)
                    if key == ord('q'):
                        break
                
                cap.release()
                cv2.destroyAllWindows()
                
                print("\nSuccessfully Downloaded Footage")