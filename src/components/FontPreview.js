import { useLayoutEffect, useMemo, useRef } from 'react';
import { from } from 'nearest-color';

// HACK silence warning about server-rendering component with `useLayoutEffect`
// https://gist.github.com/gaearon/e7d97cdf38a2907924ea12e4ebdf3c85
const useBrowserLayoutEffect =
	typeof window !== 'undefined' ? useLayoutEffect : () => {};

export function FontPreview({
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
	smoothing = true,
	width = 160,
	height = 120,
	scale = 3,
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
			findNearestColor
		);

		if (onImageDataChanged) {
			const imageData = getImageData(
				ctx,
				bounds,
				backgroundColor,
				findNearestColor
			);
			onImageDataChanged(imageData);
		}
	}, [
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
		findNearestColor,
		onImageDataChanged,
	]);

	return (
		<canvas
			ref={canvasRef}
			width={width}
			height={height}
			style={{
				width: `${width * scale}px`,
				height: `${height * scale}px`,
				imageRendering: 'pixelated',
			}}
		/>
	);
}

function drawTextToCanvas(
	ctx,
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
	findNearestColor
) {
	ctx.fillStyle = backgroundColor;
	ctx.fillRect(0, 0, width, height);

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

			ctx.fillText(line, 5, 5 + index * (+fontSize + +lineSpacing));
			if (+outlineThickness) {
				ctx.strokeText(line, 5, 5 + index * (+fontSize + +lineSpacing));
			}

			ctx.restore();
		}

		if (+outlineThickness) {
			ctx.strokeText(line, 5, 5 + index * (+fontSize + +lineSpacing));
		}
		ctx.fillText(line, 5, 5 + index * (+fontSize + +lineSpacing));
	}

	const imgData = ctx.getImageData(0, 0, width, height);
	const { data } = imgData;

	let minX = width;
	let maxX = 0;
	let minY = height;
	let maxY = 0;

	for (
		let pixelStartIndex = 0;
		pixelStartIndex < data.length;
		pixelStartIndex += 4
	) {
		const color = getColorAtOffset(data, pixelStartIndex);
		const nearestResult = findNearestColor(color);
		const { value, rgb } = nearestResult;
		[
			data[pixelStartIndex],
			data[pixelStartIndex + 1],
			data[pixelStartIndex + 2],
		] = [rgb.r, rgb.g, rgb.b];

		const pixelIndex = pixelStartIndex / 4;
		const x = pixelIndex % width;
		const y = pixelIndex / width;

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

	ctx.putImageData(imgData, 0, 0);

	return { minX, maxX, minY, maxY };
}

function getImageData(
	ctx,
	{ minX, maxX, minY, maxY },
	backgroundColor,
	findNearestColor
) {
	const subImgData = ctx.getImageData(minX, minY, maxX - minX, maxY - minY);
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

	return `#${r.toString(16).padStart(2, '0')}${g
		.toString(16)
		.padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}