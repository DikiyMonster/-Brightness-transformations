const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const histogramCanvas = document.getElementById("histogram");
const histogramCtx = histogramCanvas.getContext("2d");
let originalImage;

document.getElementById("uploadInput").addEventListener("change", handleImageUpload);

function handleImageUpload(event) {
	const file = event.target.files[0];
	const reader = new FileReader();

	reader.onload = function(event) {
		const img = new Image();
		img.onload = function() {
			canvas.width = img.width;
			canvas.height = img.height;
			ctx.drawImage(img, 0, 0);
			originalImage = ctx.getImageData(0, 0, img.width, img.height);
			drawHistogram(originalImage);
		};
		img.src = event.target.result;
	};
	reader.readAsDataURL(file);
}

function grayscale() {
	const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	for (let i = 0; i < imageData.data.length; i += 4) {
		const avg = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
		imageData.data[i] = avg;
		imageData.data[i + 1] = avg;
		imageData.data[i + 2] = avg;
	}
	ctx.putImageData(imageData, 0, 0);
	drawHistogram(imageData);
}

function applyFilters() {
	const brightnessValue = parseInt(document.getElementById("brightness").value);
	const contrastValue = parseInt(document.getElementById("contrast").value);
	const saturationValue = parseInt(document.getElementById("saturation").value);
      
	ctx.putImageData(originalImage, 0, 0);
      
	ctx.filter = `brightness(${brightnessValue}%) contrast(${contrastValue}%) saturate(${saturationValue}%)`;
	ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height);
	ctx.filter = "none";

	const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	drawHistogram(imageData);
}

function drawHistogram(imageData) {
	const histogramData = calculateHistogram(imageData);
	histogramCanvas.width = 500; 
	histogramCanvas.height = 300; 
	histogramCtx.clearRect(0, 0, histogramCanvas.width, histogramCanvas.height);

	histogramCtx.fillStyle = "black";
	histogramCtx.fillRect(0, 0, histogramCanvas.width, histogramCanvas.height);

	histogramCtx.strokeStyle = "white";
	histogramCtx.lineWidth = 1;

	for (let i = 0; i < histogramData.length; i++) {
		histogramCtx.beginPath();
		histogramCtx.moveTo(i, histogramCanvas.height);
		histogramCtx.lineTo(i, histogramCanvas.height - histogramData[i]);
		histogramCtx.stroke();
	}
}

function calculateHistogram(imageData) {
	const histogram = Array(256).fill(0);
	for (let i = 0; i < imageData.data.length; i += 4) {
		const pixelValue = imageData.data[i];
		histogram[pixelValue]++;
	}
	const max = Math.max(...histogram);
	return histogram.map(value => (value / max) * 300); 
}

function linearCorrection() {
	const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	for (let i = 0; i < imageData.data.length; i += 4) {
		// Применяем линейную коррекцию к интенсивности каждого канала RGB
		imageData.data[i] = applyLinearCorrection(imageData.data[i]);
		imageData.data[i + 1] = applyLinearCorrection(imageData.data[i + 1]);
		imageData.data[i + 2] = applyLinearCorrection(imageData.data[i + 2]);
	}
	ctx.putImageData(imageData, 0, 0);
	drawHistogram(imageData);
}

function applyLinearCorrection(value) {
	// Применяем линейную коррекцию к интенсивности пикселя
	return value * 1.2; // Пример: увеличение интенсивности на 20%
}

function nonlinearCorrection() {
	const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	for (let i = 0; i < imageData.data.length; i += 4) {
		// Применяем нелинейную коррекцию к интенсивности каждого канала RGB
		imageData.data[i] = applyNonlinearCorrection(imageData.data[i]);
		imageData.data[i + 1] = applyNonlinearCorrection(imageData.data[i + 1]);
		imageData.data[i + 2] = applyNonlinearCorrection(imageData.data[i + 2]);
	}
	ctx.putImageData(imageData, 0, 0);
	drawHistogram(imageData);
}

function applyNonlinearCorrection(value) {
	// Применяем нелинейную коррекцию к интенсивности пикселя
	return Math.pow(value / 255, 1.5) * 255; // Пример: применение квадратного корня
}