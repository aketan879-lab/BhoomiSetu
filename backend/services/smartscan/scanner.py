import cv2
import numpy as np
from typing import List

class ImagePreprocessor:
    """
    Handles pre-processing of land record images before OCR.
    Includes operations like cropping, deskewing, denoising, and contrast enhancement.
    """
    
    def preprocess(self, image_bytes: bytes) -> np.ndarray:
        """
        Main pipeline to auto-crop, deskew, denoise, and enhance contrast.
        """
        # Decode image
        np_arr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        if image is None:
            raise ValueError("Invalid image bytes provided.")

        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Denoise
        denoised = cv2.fastNlMeansDenoising(gray, None, 10, 7, 21)
        
        # Contrast enhancement using CLAHE
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(denoised)
        
        # Deskewing
        coords = np.column_stack(np.where(enhanced > 0))
        if len(coords) > 0:
            angle = cv2.minAreaRect(coords)[-1]
            if angle < -45:
                angle = -(90 + angle)
            else:
                angle = -angle
                
            (h, w) = enhanced.shape[:2]
            center = (w // 2, h // 2)
            M = cv2.getRotationMatrix2D(center, angle, 1.0)
            enhanced = cv2.warpAffine(enhanced, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
            
        return enhanced

    def detect_document_edges(self, image: np.ndarray) -> np.ndarray:
        """
        Detects the contour coordinates of the document within the image.
        """
        blurred = cv2.GaussianBlur(image, (5, 5), 0)
        edged = cv2.Canny(blurred, 75, 200)
        
        contours, _ = cv2.findContours(edged.copy(), cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
        contours = sorted(contours, key=cv2.contourArea, reverse=True)[:5]
        
        document_contour = None
        for c in contours:
            peri = cv2.arcLength(c, True)
            approx = cv2.approxPolyDP(c, 0.02 * peri, True)
            if len(approx) == 4:
                document_contour = approx
                break
                
        if document_contour is None:
            # Fallback to image corners if no document shape found
            h, w = image.shape[:2]
            document_contour = np.array([[[0, 0]], [[w, 0]], [[w, h]], [[0, h]]])
            
        return document_contour

    def enhance_degraded(self, image: np.ndarray) -> np.ndarray:
        """
        Specifically enhances faded or physically damaged documents.
        """
        # Binarization with adaptive thresholding for faded ink
        thresh = cv2.adaptiveThreshold(
            image, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
        )
        # Morphological operations to connect broken text
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (2, 2))
        enhanced = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
        return enhanced

    def stitch_pages(self, images: List[np.ndarray]) -> np.ndarray:
        """
        Stitches multiple pages vertically into a single image.
        """
        if not images:
            raise ValueError("No images provided for stitching.")
            
        # Resize to max width for consistent vertical stacking
        max_width = max(img.shape[1] for img in images)
        resized_images = []
        for img in images:
            h, w = img.shape[:2]
            if w != max_width:
                aspect_ratio = h / w
                new_h = int(max_width * aspect_ratio)
                resized = cv2.resize(img, (max_width, new_h))
                resized_images.append(resized)
            else:
                resized_images.append(img)
                
        # Stack vertically
        return np.vstack(resized_images)
