import io
import torch
from torchvision import transforms
import av

class tokenizer:
    """
    Tokenizes video data (from bytes or file path) into a sequence of frame tensors.

    Each frame is resized, normalized, and converted to a PyTorch tensor,
    ready for embedding via convolutional layers.
    """
    def __init__(
        self,
        frame_rate: int = 1,
        frame_size: tuple = (224, 224),
        device: str = 'cpu',
    ):
        """
        Args:
            frame_rate: sample one frame every `frame_rate` frames
            frame_size: (height, width) for each frame tensor
            device: torch device (e.g., 'cpu' or 'cuda')
        """
        self.frame_rate = frame_rate
        self.frame_size = frame_size
        self.device = device
        # torchvision transformation pipeline
        self.transform = transforms.Compose([
            transforms.ToPILImage(),
            transforms.Resize(frame_size),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])
        
    def tokenize(self, video_source) -> torch.Tensor:
        """
        Accepts either raw video bytes or a file path and returns a tensor of frames.

        Args:
            video_source: bytes of video data (e.g., .webm blob) or file path string.

        Returns:
            Tensor of shape (T, 3, H, W), T = number of sampled frames.
        """
        # decide input type
        if isinstance(video_source, (bytes, bytearray)):
            container = av.open(io.BytesIO(video_source), format='webm')
        elif isinstance(video_source, str):
            container = av.open(video_source)
        else:
            raise ValueError("video_source must be bytes or file path string.")

        frames = []
        for idx, frame in enumerate(container.decode(video=0)):
            if idx % self.frame_rate == 0:
                img = frame.to_ndarray(format='rgb24')
                tensor = self.transform(img).to(self.device)
                frames.append(tensor)
        container.close()

        if not frames:
            raise ValueError("No frames extracted. Check your video input or frame_rate.")

        return torch.stack(frames, dim=0)


if __name__ == "__main__":
    # Example: decoding from a file path
    tokenizer = tokenizer(frame_rate=10, frame_size=(224,224), device='cpu')
    tokens = tokenizer.tokenize("debug_upload.webm")
    print(f"From file: Extracted {tokens.shape[0]} frames of size {tokens.shape[2:]}.")

    # Example: decoding from raw bytes
    with open("debug_upload.webm", "rb") as f:
        data = f.read()
    tokens2 = tokenizer.tokenize(data)
    print(f"From bytes: Extracted {tokens2.shape[0]} frames.")
