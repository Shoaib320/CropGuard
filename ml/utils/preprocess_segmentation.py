import cv2
import os
from pathlib import Path
from segmentation import segment_leaf
from tqdm import tqdm

def process_dataset(src_root, dst_root):
    src_root = Path(src_root)
    dst_root = Path(dst_root)

    class_folders = [d for d in src_root.iterdir() if d.is_dir()]
    print(f"Found {len(class_folders)} class folders in {src_root}")

    total_images = 0
    failed = 0

    for class_folder in class_folders:
        dst_class_folder = dst_root / class_folder.name
        dst_class_folder.mkdir(parents=True, exist_ok=True)

        image_files = list(class_folder.glob("*.*"))

        for img_path in tqdm(image_files, desc=class_folder.name, leave=False):
            dst_path = dst_class_folder / img_path.name

            if dst_path.exists():
                continue  # skip already-processed images (resumable)

            img = cv2.imread(str(img_path))
            if img is None:
                failed += 1
                continue

            segmented = segment_leaf(img)
            cv2.imwrite(str(dst_path), segmented)
            total_images += 1

    print(f"\nDone. Processed {total_images} images, {failed} failed to read.")

if __name__ == "__main__":
    # PlantVillage
    process_dataset(
        src_root=r"C:\Users\Admin\Desktop\CropGuard\CropGuard\ml\data\plantvillage\plantvillage dataset\plantvillage dataset\color",
        dst_root=r"C:\Users\Admin\Desktop\CropGuard\CropGuard\ml\data\plantvillage_segmented"
    )

    # PlantDoc train
    process_dataset(
        src_root=r"C:\Users\Admin\Desktop\CropGuard\CropGuard\ml\data\plantdoc\archive\train",
        dst_root=r"C:\Users\Admin\Desktop\CropGuard\CropGuard\ml\data\plantdoc_segmented\train"
    )

    # PlantDoc test
    process_dataset(
        src_root=r"C:\Users\Admin\Desktop\CropGuard\CropGuard\ml\data\plantdoc\archive\test",
        dst_root=r"C:\Users\Admin\Desktop\CropGuard\CropGuard\ml\data\plantdoc_segmented\test"
    )