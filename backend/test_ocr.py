import pytesseract
import cv2
import os

# Optional: set path if needed
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

print("Current Directory:", os.getcwd())

# img = cv2.imread("test1.png")
img = cv2.imread(r"C:\Users\Abhishek Satyarum\My Projects\MiniProject_sem4\SPARSH\backend\test1.png")

if img is None:
    print("❌ Image not found. Check path.")
else:
    text = pytesseract.image_to_string(img)
    print("✅ Extracted Text:\n")
    print(text)