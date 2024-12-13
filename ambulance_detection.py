import cv2
import numpy as np
from threading import Thread
from queue import Queue
import time

class VideoStreamProcessor:
    def __init__(self, weights_path, config_path, video_path, confidence_threshold=0.3):
        self.net = cv2.dnn.readNet(weights_path, config_path)
        
        # Enable CUDA if available
        self.net.setPreferableBackend(cv2.dnn.DNN_BACKEND_CUDA)
        self.net.setPreferableTarget(cv2.dnn.DNN_TARGET_CUDA)
        
        self.classes = ["Ambulance"]
        self.video_path = video_path
        self.confidence_threshold = confidence_threshold
        self.frame_queue = Queue(maxsize=30)
        self.result_queue = Queue()
        self.stopped = False
        
        # Initialize video capture
        self.cap = cv2.VideoCapture(video_path)
        self.fps = self.cap.get(cv2.CAP_PROP_FPS)
        self.frame_skip = max(1, int(self.fps / 20))  # Process max 20 fps
        
        # Colors for visualization
        self.colors = np.random.uniform(0, 255, size=(100, 3))

    def start(self):
        # Start threads for frame reading and processing
        Thread(target=self.read_frames, daemon=True).start()
        Thread(target=self.process_frames, daemon=True).start()
        Thread(target=self.display_results, daemon=True).start()
        return self

    def read_frames(self):
        frame_count = 0
        while not self.stopped:
            if not self.frame_queue.full():
                grabbed, frame = self.cap.read()
                if not grabbed:
                    self.stopped = True
                    break
                
                # Skip frames for performance
                frame_count += 1
                if frame_count % self.frame_skip != 0:
                    continue
                    
                self.frame_queue.put(frame)
            else:
                time.sleep(0.001)  # Prevent CPU overload

    def process_frames(self):
        while not self.stopped:
            if not self.frame_queue.empty():
                frame = self.frame_queue.get()
                
                # Preprocess frame
                height, width = frame.shape[:2]
                blob = cv2.dnn.blobFromImage(
                    frame, 
                    1/255.0, 
                    (416, 416), 
                    swapRB=True, 
                    crop=False
                )
                
                # Detect objects
                self.net.setInput(blob)
                output_layers = self.net.getUnconnectedOutLayersNames()
                layer_outputs = self.net.forward(output_layers)
                
                # Process detections
                boxes, confidences, class_ids = [], [], []
                
                for output in layer_outputs:
                    for detection in output:
                        scores = detection[5:]
                        class_id = np.argmax(scores)
                        confidence = scores[class_id]
                        
                        if confidence > self.confidence_threshold:
                            center_x = int(detection[0] * width)
                            center_y = int(detection[1] * height)
                            w = int(detection[2] * width)
                            h = int(detection[3] * height)
                            x = int(center_x - w/2)
                            y = int(center_y - h/2)
                            
                            boxes.append([x, y, w, h])
                            confidences.append(float(confidence))
                            class_ids.append(class_id)
                
                # Apply non-maximum suppression
                indices = cv2.dnn.NMSBoxes(
                    boxes, 
                    confidences, 
                    self.confidence_threshold, 
                    0.4
                )
                
                # Draw results
                if len(indices) > 0:
                    for i in indices.flatten():
                        x, y, w, h = boxes[i]
                        label = self.classes[class_ids[i]]
                        confidence = confidences[i]
                        color = self.colors[class_ids[i]]
                        
                        cv2.rectangle(
                            frame, 
                            (x, y), 
                            (x + w, y + h), 
                            color, 
                            2
                        )
                        cv2.putText(
                            frame,
                            f"{label} {confidence:.2f}",
                            (x, y - 10),
                            cv2.FONT_HERSHEY_SIMPLEX,
                            0.6,
                            color,
                            2
                        )
                
                self.result_queue.put(frame)
            else:
                time.sleep(0.001)  # Prevent CPU overload

    def display_results(self):
        prev_time = time.time()
        fps_counter = 0
        
        while not self.stopped:
            if not self.result_queue.empty():
                frame = self.result_queue.get()
                
                # Calculate and display FPS
                fps_counter += 1
                if time.time() - prev_time >= 1.0:
                    fps = fps_counter
                    fps_counter = 0
                    prev_time = time.time()
                    cv2.putText(
                        frame,
                        f"FPS: {fps}",
                        (10, 30),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        1,
                        (0, 255, 0),
                        2
                    )
                
                cv2.imshow("Ambulance Detection", frame)
                
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    self.stopped = True
                    break
            else:
                time.sleep(0.001)  # Prevent CPU overload

    def stop(self):
        self.stopped = True
        self.cap.release()
        cv2.destroyAllWindows()

def main():
    weights_path = "yolov3_training_last_2.weights"
    config_path = "yolov3_testing.cfg"
    video_path = "ambulance_video.mp4"
    
    try:
        processor = VideoStreamProcessor(
            weights_path,
            config_path,
            video_path,
            confidence_threshold=0.3
        )
        
        processor.start()
        
        # Keep main thread alive
        while not processor.stopped:
            time.sleep(0.1)
            
    except KeyboardInterrupt:
        print("Stopping...")
    finally:
        processor.stop()

if __name__ == "__main__":
    main()