import json
# You need to pip install exponent_server_sdk
from exponent_server_sdk import (
    DeviceNotRegisteredError,
    PushClient,
    PushMessage,
    PushServerError,
    PushTicketError,
)

def confirm(q): 
    while True:
        if not q.empty():
            key = q.get()
            if type(key) == str:
                break
            else:
                status = json.load(open('status.json'))
                push_token = "ExponentPushToken[b0O88ZIBdA5tWkdd8B-iOD]"

                message = PushMessage(
                    to=push_token,
                    channel_id="weapon_detected",
                    sound="emergencysos.wav",
                    title="Weapon Detected!",
                    body="A potential weapon has been detected. Please check immediately.",
                    data={"url": "screens/verification"}
                )
                    
                # for box in key:
                #     print(box)
                try:
                    if status['detected'] is False:
                        response = PushClient().publish(message)
                        print("Notification sent:", response)
                except PushResponseError as exc:
                    print("Error sending notification:", exc.errors)
                status['detected'] = True                    
                status['confirmed'] = True
                
                with open('status.json', 'w') as f:
                    json.dump(status, f, indent=4)