import torch.nn as nn

class HandPointClassifier(nn.Module):
    def __init__(self, num_classes, in_dim=42, hidden=128):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(in_dim, hidden),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(hidden, hidden),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(hidden, num_classes)
        )

    def forward(self, x, return_probs=True):
        logits = self.net(x)
        if return_probs:
            return nn.functional.softmax(logits, dim=1)
        return logits