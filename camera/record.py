def record(q):
    while True:
        if not q.empty():
            key = q.get()
            if key == "stop":
                break
            else:
                print(key)