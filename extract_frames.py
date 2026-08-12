import os
import cv2

def extract_frames():
    desktop_video = os.path.join("public", "nourla", "landing video.mp4")
    mobile_video = os.path.join("public", "nourla", "mobil video (2).mp4")

    if not os.path.exists(mobile_video):
        mobile_video = os.path.join("public", "nourla", "mobil video.mp4")

    desktop_dir = os.path.join("public", "frames", "desktop")
    mobile_dir = os.path.join("public", "frames", "mobile")

    os.makedirs(desktop_dir, exist_ok=True)
    os.makedirs(mobile_dir, exist_ok=True)

    # 1. EXTRACT FULL DESKTOP FRAMES (300 WebP frames covering 24 seconds)
    print("--- Extracting Desktop Frames (16:9 1280x720, 300 frames) ---")
    cap_d = cv2.VideoCapture(desktop_video)
    if cap_d.isOpened():
        total_d = int(cap_d.get(cv2.CAP_PROP_FRAME_COUNT))
        step_d = total_d / 300
        for i in range(300):
            frame_id = int(i * step_d)
            cap_d.set(cv2.CAP_PROP_POS_FRAMES, frame_id)
            ret, frame = cap_d.read()
            if not ret: break
            resized = cv2.resize(frame, (1280, 720), interpolation=cv2.INTER_AREA)
            out_path = os.path.join(desktop_dir, f"frame_{i+1:04d}.webp")
            cv2.imwrite(out_path, resized, [int(cv2.IMWRITE_WEBP_QUALITY), 75])
            if (i + 1) % 50 == 0 or (i + 1) == 300:
                print(f"Desktop: {i+1}/300 frames...")
        cap_d.release()

    # 2. EXTRACT FULL MOBILE FRAMES (300 WebP frames covering full 23.3 seconds 9:16)
    print("--- Extracting Mobile Frames (9:16 540x960, 300 frames) ---")
    cap_m = cv2.VideoCapture(mobile_video)
    if cap_m.isOpened():
        total_m = int(cap_m.get(cv2.CAP_PROP_FRAME_COUNT))
        step_m = total_m / 300
        for i in range(300):
            frame_id = int(i * step_m)
            cap_m.set(cv2.CAP_PROP_POS_FRAMES, frame_id)
            ret, frame = cap_m.read()
            if not ret: break
            resized = cv2.resize(frame, (540, 960), interpolation=cv2.INTER_AREA)
            out_path = os.path.join(mobile_dir, f"frame_{i+1:04d}.webp")
            cv2.imwrite(out_path, resized, [int(cv2.IMWRITE_WEBP_QUALITY), 65])
            if (i + 1) % 50 == 0 or (i + 1) == 300:
                print(f"Mobile: {i+1}/300 frames...")
        cap_m.release()

    print("Success! All 300 Desktop and 300 Mobile WebP frames extracted successfully.")

if __name__ == "__main__":
    extract_frames()
