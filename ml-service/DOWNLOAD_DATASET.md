# Download Dataset Manual

Dataset terlalu besar (1GB+) untuk auto-download. Ikuti langkah berikut:

## Step 1: Download Dataset
1. Buka link: https://drive.google.com/file/d/17Prl_TFgyOkkiFlek2r6MyknjAOPs3d7/view?usp=drive_link
2. Klik "Download" di Google Drive
3. File yang didownload: `batik_dataset.zip` (~1GB)

## Step 2: Extract Dataset
```bash
cd /home/muhammadmaftuh/warisan-digital/ml-service
unzip /path/to/downloaded/batik_dataset.zip -d dataset
```

## Step 3: Struktur yang Diharapkan
```
ml-service/
  dataset/
    train/
      Parang/*.jpg
      Lereng/*.jpg
      Ceplok/*.jpg
      Kawung/*.jpg
      Nitik/*.jpg
    test/
      Parang/*.jpg
      Lereng/*.jpg
      Ceplok/*.jpg
      Kawung/*.jpg
      Nitik/*.jpg
```

## Step 4: Verify Dataset
```bash
cd /home/muhammadmaftuh/warisan-digital/ml-service
python3 verify_dataset.py
```

## Alternative: Use Kaggle Dataset
Jika Google Drive tidak work, coba dataset alternatif dari Kaggle:
- https://www.kaggle.com/datasets/dionisiusdh/indonesian-batik-motifs
- https://www.kaggle.com/datasets/zanetwo/batik-pattern-dataset

## Next Steps
Setelah dataset ready, jalankan:
```bash
cd /home/muhammadmaftuh/warisan-digital/ml-service
source venv/bin/activate
python train_vgg16.py
```
