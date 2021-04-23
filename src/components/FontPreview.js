import { useLayoutEffect, useMemo, useRef } from 'react';
import { from } from 'nearest-color';

// HACK silence warning about server-rendering component with `useLayoutEffect`
// https://gist.github.com/gaearon/e7d97cdf38a2907924ea12e4ebdf3c85
const useBrowserLayoutEffect =
	typeof window !== 'undefined' ? useLayoutEffect : () => {};

export function FontPreview({
	originX,
	originY,
	text,
	font,
	fontSize,
	lineSpacing,
	color,
	backgroundColor,
	outlineColor,
	outlineThickness,
	shadowColor,
	shadowBlur,
	shadowOffsetX,
	shadowOffsetY,
	palette,
	smoothing,
	dithering,
	width = 160,
	height = 120,
	onImageDataChanged,
}) {
	const canvasRef = useRef();

	const findNearestColor = useMemo(
		() =>
			!smoothing
				? from({
						[palette.indexOf(backgroundColor)]: backgroundColor,
						[palette.indexOf(color)]: color,
						...(outlineColor && {
							[palette.indexOf(outlineColor)]: outlineColor,
						}),
						...(shadowColor && {
							[palette.indexOf(shadowColor)]: shadowColor,
						}),
				  })
				: from(
						Object.fromEntries(
							palette.map((color, index) => [index, color]).slice(1)
						)
				  ),
		[smoothing, color, backgroundColor, outlineColor, shadowColor, palette]
	);

	useBrowserLayoutEffect(() => {
		const ctx = canvasRef.current.getContext('2d');

		const bounds = drawTextToCanvas(
			ctx,
			originX,
			originY,
			text,
			font,
			fontSize,
			lineSpacing,
			color,
			backgroundColor,
			outlineColor,
			outlineThickness,
			shadowColor,
			shadowBlur,
			shadowOffsetX,
			shadowOffsetY,
			width,
			height,
			dithering,
			findNearestColor
		);

		if (onImageDataChanged) {
			const imageData = getImageData(
				ctx,
				bounds,
				backgroundColor,
				findNearestColor
			);
			onImageDataChanged(
				imageData && {
					data: imageData,
					width: bounds.width,
					height: bounds.height,
				}
			);
		}
	}, [
		originX,
		originY,
		text,
		font,
		fontSize,
		lineSpacing,
		color,
		backgroundColor,
		outlineColor,
		outlineThickness,
		shadowColor,
		shadowBlur,
		shadowOffsetX,
		shadowOffsetY,
		width,
		height,
		dithering,
		findNearestColor,
		onImageDataChanged,
	]);

	return (
		<canvas
			ref={canvasRef}
			width={width}
			height={height}
			css={`
				image-rendering: pixelated;
			`}
		/>
	);
}

function drawTextToCanvas(
	ctx,
	originX,
	originY,
	text,
	font,
	fontSize,
	lineSpacing,
	color,
	backgroundColor,
	outlineColor,
	outlineThickness,
	shadowColor,
	shadowBlur,
	shadowOffsetX,
	shadowOffsetY,
	width,
	height,
	dithering,
	findNearestColor
) {
	ctx.fillStyle = backgroundColor;
	ctx.fillRect(0, 0, width, height);

	if (!font) {
		return;
	}

	ctx.save();

	ctx.translate(originX, originY);

	ctx.fillStyle = color;
	ctx.textBaseline = 'top';
	ctx.font = `${fontSize}px ${font}`;

	ctx.strokeStyle = outlineColor;
	ctx.lineWidth = +outlineThickness;
	ctx.lineJoin = 'round';

	for (const { line, index } of text
		.split('\n')
		.map((line, index) => ({ line, index }))) {
		if (+shadowBlur || +shadowOffsetX || +shadowOffsetY) {
			ctx.save();

			ctx.shadowColor = shadowColor;
			ctx.shadowBlur = +shadowBlur;
			ctx.shadowOffsetX = +shadowOffsetX;
			ctx.shadowOffsetY = +shadowOffsetY;

			ctx.fillText(line, 0, index * (+fontSize + +lineSpacing));
			if (+outlineThickness) {
				ctx.strokeText(line, 0, index * (+fontSize + +lineSpacing));
			}

			ctx.restore();
		}

		if (+outlineThickness) {
			ctx.strokeText(line, 0, index * (+fontSize + +lineSpacing));
		}
		ctx.fillText(line, 0, index * (+fontSize + +lineSpacing));
	}

	const imgData = ctx.getImageData(0, 0, width, height);
	const { data } = imgData;

	// map to wider range than 0-255 for intermediate out-of-bounds
	// states for pixel channels during dithering calculation
	const d = new Int16Array(data);

	let minX = width - 1;
	let maxX = 0;
	let minY = height - 1;
	let maxY = 0;

	for (
		let pixelStartIndex = 0;
		pixelStartIndex < d.length;
		pixelStartIndex += 4
	) {
		const pixelIndex = pixelStartIndex / 4;
		const x = pixelIndex % width;
		const y = Math.trunc(pixelIndex / width);

		const color = getColorAtOffset(d, pixelStartIndex);
		const nearestResult = findNearestColor(color);
		const { value, rgb } = nearestResult;

		if (dithering) {
			const [oldR, oldG, oldB] = [
				d[pixelStartIndex],
				d[pixelStartIndex + 1],
				d[pixelStartIndex + 2],
			];

			const errR = oldR - rgb.r;
			const errG = oldG - rgb.g;
			const errB = oldB - rgb.b;

			// https://en.wikipedia.org/wiki/Floyd%E2%80%93Steinberg_dithering
			const neighbors = [
				[[1, 0], 7 / 16],
				[[-1, 1], 3 / 16],
				[[0, 1], 5 / 16],
				[[1, 1], 1 / 16],
			];

			for (const [offset, factor] of neighbors) {
				const neighborX = x + offset[0];
				const neighborY = y + offset[1];

				if (neighborX > 0 && neighborX < width && neighborY < height) {
					const neighborPixelIndex = neighborY * width + neighborX;
					const neighborPixelDataStart = neighborPixelIndex * 4;

					[
						d[neighborPixelDataStart],
						d[neighborPixelDataStart + 1],
						d[neighborPixelDataStart + 2],
					] = [
						d[neighborPixelDataStart] + Math.round(errR * factor),
						d[neighborPixelDataStart + 1] + Math.round(errG * factor),
						d[neighborPixelDataStart + 2] + Math.round(errB * factor),
					];
				}
			}
		}

		[d[pixelStartIndex], d[pixelStartIndex + 1], d[pixelStartIndex + 2]] = [
			rgb.r,
			rgb.g,
			rgb.b,
		];

		// track bounds of non-background pixels
		if (value !== backgroundColor) {
			if (x < minX) {
				minX = x;
			}
			if (x > maxX) {
				maxX = x;
			}
			if (y < minY) {
				minY = y;
			}
			if (y > maxY) {
				maxY = y;
			}
		}
	}

	const newImgData = new ImageData(new Uint8ClampedArray(d), width, height);
	ctx.putImageData(newImgData, 0, 0);

	ctx.restore();

	return {
		x: minX,
		y: minY,
		width: Math.max(maxX - minX + 1, 0),
		height: Math.max(maxY - minY + 1, 0),
	};
}

function getImageData(
	ctx,
	{ x, y, width, height } = {},
	backgroundColor,
	findNearestColor
) {
	if (!width && !height) {
		return;
	}

	const subImgData = ctx.getImageData(x, y, width, height);
	const { data, width: drawnWidth } = subImgData;

	let img = '';
	for (
		let pixelStartIndex = 0;
		pixelStartIndex < data.length;
		pixelStartIndex += 4
	) {
		const color = getColorAtOffset(data, pixelStartIndex);
		const nearestResult = findNearestColor(color);
		const { name, value } = nearestResult;

		const pixelIndex = pixelStartIndex / 4;
		if (pixelIndex && pixelIndex % drawnWidth === 0) {
			img += '\n';
		}

		img += value === backgroundColor ? '.' : (+name).toString(16);
	}

	return `img\`
${img}
\``;
}

function getColorAtOffset(data, colorStartIndex) {
	const [r, g, b] = [
		data[colorStartIndex],
		data[colorStartIndex + 1],
		data[colorStartIndex + 2],
	];

	return `#${clamp(r, 0, 255).toString(16).padStart(2, '0')}${clamp(g, 0, 255)
		.toString(16)
		.padStart(2, '0')}${clamp(b, 0, 255).toString(16).padStart(2, '0')}`;
}

function clamp(value, min, max) {
	return Math.max(min, Math.min(value, max));
}
