import cv2
import numpy as np

def segment_leaf(image_bgr):
    """
    Isolates the leaf from background using HSV color thresholding + contour detection.
    Input: image in BGR format (as read by cv2.imread)
    Output: image with background masked to black, leaf preserved
    """
    hsv = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2HSV)

    # Broad range covering healthy green AND common disease colors
    # (brown/yellow spots, rust, blight) so we don't cut out diseased regions
    lower1 = np.array([15, 30, 30])    # yellow-green-brown lower bound
    upper1 = np.array([90, 255, 255])  # green upper bound

    mask = cv2.inRange(hsv, lower1, upper1)

    # Clean up mask: remove small noise, fill small holes
    kernel = np.ones((7, 7), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=2)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel, iterations=1)

    # Find largest contour = the leaf (assumes leaf is the dominant object)
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    if not contours:
        # Fallback: no leaf detected, return original image unmasked
        return image_bgr

    largest_contour = max(contours, key=cv2.contourArea)

    # Only trust the contour if it covers a reasonable chunk of the image
    # (avoids masking everything out on a bad detection)
    image_area = image_bgr.shape[0] * image_bgr.shape[1]
    if cv2.contourArea(largest_contour) < 0.05 * image_area:
        return image_bgr

    clean_mask = np.zeros_like(mask)
    cv2.drawContours(clean_mask, [largest_contour], -1, 255, thickness=cv2.FILLED)

    result = cv2.bitwise_and(image_bgr, image_bgr, mask=clean_mask)
    return result