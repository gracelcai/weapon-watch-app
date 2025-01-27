import json

def confirm(q): 
    while True:
        if not q.empty():
            key = q.get()
            if type(key) == str:
                break
            else:
                status = json.load(open('status.json'))
                
                status['detected'] = True
                    
                # for box in key:
                #     print(box)
                    
                status['confirmed'] = True
                
                with open('status.json', 'w') as f:
                    json.dump(status, f, indent=4)