import torch
import torch.nn as nn

class CNNClassifier(nn.Module):
    def __init__(self, num_classes, img_size=(224,224)):
        super().__init__()
        c, h, w = 3, *img_size
        self.features = nn.Sequential(
            nn.Conv2d(c, 32, 3, padding=1), nn.BatchNorm2d(32), nn.ReLU(), nn.MaxPool2d(2), nn.Dropout(0.25),
            nn.Conv2d(32,64,3,padding=1), nn.BatchNorm2d(64), nn.ReLU(), nn.MaxPool2d(2), nn.Dropout(0.25),
            nn.Conv2d(64,128,3,padding=1), nn.BatchNorm2d(128), nn.ReLU(), nn.MaxPool2d(2), nn.Dropout(0.25),
        )
        with torch.no_grad():
            dummy = torch.zeros(1, c, h, w)
            n_feats = self.features(dummy).numel()
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(n_feats, 256), nn.ReLU(), nn.Dropout(0.5),
            nn.Linear(256, num_classes)
        )
    def forward(self, x):
        x = self.features(x)
        x = self.classifier(x)
        return x
