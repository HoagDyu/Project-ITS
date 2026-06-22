from pathlib import Path

from django.core.files import File
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import SimpleTestCase

import cv2 as cv

from .apps import ReadFile


def test_read_img(file):
    return ReadFile.read_img(file)


def resize_for_imshow(img, max_width=1280, max_height=720):
    height, width = img.shape[:2]

    scale = min(max_width / width, max_height / height, 1)
    if scale == 1:
        return img

    new_width = int(width * scale)
    new_height = int(height * scale)

    return cv.resize(img, (new_width, new_height), interpolation=cv.INTER_AREA)


def make_uploaded_file(file_path, content_type):
    with open(file_path, "rb") as file:
        return SimpleUploadedFile(
            file_path.name,
            file.read(),
            content_type=content_type,
        )


def iter_detection_results(processed_results):
    for result_group in processed_results:
        if isinstance(result_group, (list, tuple)):
            yield from result_group
        else:
            yield result_group


class OpenCVTests(SimpleTestCase):
    def test_process_file_with_uploaded_image(self):
        video_dir = Path(__file__).resolve().parents[2] / "video"
        uploaded_file = make_uploaded_file(video_dir / "test3.jpg", "image/jpeg")

        try:
            detected_results = ReadFile.process_file(uploaded_file)

            self.assertIsInstance(detected_results, list)
            self.assertGreater(len(detected_results), 0)

            displayed_count = 0
            for detection_result in iter_detection_results(detected_results):
                detected_frame = detection_result.plot()
                self.assertIsNotNone(detected_frame)

                display_frame = resize_for_imshow(detected_frame)
                cv.imshow("process_file image", display_frame)
                displayed_count += 1

                cv.waitKey(0)

            self.assertGreater(displayed_count, 0)
        finally:
            cv.destroyAllWindows()

    def test_process_file_with_uploaded_video_streams_each_detected_frame(self):
        video_path = Path(__file__).resolve().parents[2] / "video" / "test.mp4"
        detected_results = None

        try:
            with open(video_path, "rb") as video_file:
                uploaded_file = File(video_file, name=video_path.name)
                detected_results = ReadFile.process_file(uploaded_file)

                self.assertIsNotNone(detected_results)

                displayed_count = 0
                for detection_result in iter_detection_results(detected_results):
                    detected_frame = detection_result.plot()
                    self.assertIsNotNone(detected_frame)

                    display_frame = resize_for_imshow(detected_frame)
                    cv.imshow("process_file video", display_frame)
                    displayed_count += 1

                    key = cv.waitKey(1)
                    if key & 0xFF == ord("q"):
                        break

                self.assertGreater(displayed_count, 0)
                cv.waitKey(0)
        finally:
            if hasattr(detected_results, "close"):
                detected_results.close()
            cv.destroyAllWindows()

    
