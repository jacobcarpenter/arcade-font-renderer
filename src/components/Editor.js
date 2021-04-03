import { useMemo, useState } from 'react';
import { palette } from '../palette';
import { Stack, HorizontalFlex, FlexInput, NoFlex } from './LayoutHelpers';
import { FontPreview } from './FontPreview';
import { ColorPicker } from './ColorPicker';
import { SmoothingInput } from './SmoothingInput';

export function Editor() {
	const colors = useMemo(() => palette.slice(1), []);

	const [color, setColor] = useState(palette[13]);
	const [backgroundColor, setBackgroundColor] = useState(palette[15]);

	const [fontFamily, setFontFamily] = useState('Luminari, Monotype Corsiva');
	const [fontSize, setFontSize] = useState('30');
	const [lineSpacing, setLineSpacing] = useState('4');
	const [smoothing, setSmoothing] = useState(true);

	const [text, setText] = useState('The Last\nFantasy\nGame IV');

	const [outline, setOutline] = useState(false);
	const [outlineColor, setOutlineColor] = useState(palette[12]);
	const [outlineThickness, setOutlineThickness] = useState('4');

	const [shadow, setShadow] = useState(false);
	const [shadowColor, setShadowColor] = useState(palette[14]);
	const [shadowBlur, setShadowBlur] = useState(3);
	const [shadowOffsetX, setShadowOffsetX] = useState(2);
	const [shadowOffsetY, setShadowOffsetY] = useState(2);

	const [imgData, setImgData] = useState('');

	return (
		<Stack spacing={16}>
			<FontPreview
				text={text}
				font={fontFamily}
				fontSize={fontSize}
				lineSpacing={lineSpacing}
				color={color}
				backgroundColor={backgroundColor}
				outlineColor={outline && outlineColor}
				outlineThickness={outline && outlineThickness}
				shadowColor={shadow && shadowColor}
				shadowBlur={shadow && shadowBlur}
				shadowOffsetX={shadow && shadowOffsetX}
				shadowOffsetY={shadow && shadowOffsetY}
				smoothing={smoothing}
				palette={palette}
				onImageDataChanged={setImgData}
			/>

			<HeaderedSection header="Background">
				<ColorPicker
					colors={colors}
					selectedColor={backgroundColor}
					onChange={setBackgroundColor}
				/>
			</HeaderedSection>

			<HeaderedSection header="Color">
				<ColorPicker
					colors={colors}
					selectedColor={color}
					onChange={setColor}
				/>
			</HeaderedSection>

			<HeaderedSection header="Font / Size / Spacing">
				<HorizontalFlex spacing={8}>
					<FlexInput
						type="text"
						value={fontFamily}
						onFocus={(e) => e.target.select()}
						onChange={(e) => setFontFamily(e.target.value)}
					/>

					<input
						type="number"
						value={fontSize}
						onChange={(e) => {
							setFontSize(e.target.value);
						}}
						css={`
							max-width: 80px;
						`}
					/>

					<input
						type="number"
						value={lineSpacing}
						onChange={(e) => {
							setLineSpacing(e.target.value);
						}}
						css={`
							max-width: 40px;
						`}
					/>

					<NoFlex>
						<SmoothingInput value={smoothing} onChange={setSmoothing} />
					</NoFlex>
				</HorizontalFlex>
			</HeaderedSection>

			<HeaderedSection header="Text">
				{/*
                    stop using controlled input textarea?
                    https://github.com/facebook/react/issues/8514

                    TODO: debounce updates to canvas?
                */}
				<textarea
					rows="5"
					value={text}
					onChange={(e) => {
						setText(e.target.value);
					}}
					css={`
						width: 100%;
					`}
				/>
			</HeaderedSection>

			<HeaderedSection
				header={
					<label>
						<input
							type="checkbox"
							checked={outline}
							onChange={(e) => {
								setOutline(e.target.checked);
							}}
						/>{' '}
						Outline
					</label>
				}
			>
				{outline && (
					<Stack
						spacing={8}
						css={`
							margin-left: 24px;
						`}
					>
						<ColorPicker
							colors={colors}
							selectedColor={outlineColor}
							onChange={setOutlineColor}
						/>

						<HeaderedSection header="Thickness">
							<input
								type="number"
								min="0"
								value={outlineThickness}
								onChange={(e) => {
									setOutlineThickness(e.target.value);
								}}
								css={`
									max-width: 80px;
								`}
							/>
						</HeaderedSection>
					</Stack>
				)}
			</HeaderedSection>

			<HeaderedSection
				header={
					<label>
						<input
							type="checkbox"
							checked={shadow}
							onChange={(e) => {
								setShadow(e.target.checked);
							}}
						/>{' '}
						Shadow
					</label>
				}
			>
				{shadow && (
					<Stack
						spacing={8}
						css={`
							margin-left: 24px;
						`}
					>
						<ColorPicker
							colors={colors}
							selectedColor={shadowColor}
							onChange={setShadowColor}
						/>

						<HeaderedSection header="Blur / Offset X / Offset Y">
							<HorizontalFlex spacing={8}>
								<input
									type="number"
									min="0"
									value={shadowBlur}
									onChange={(e) => {
										setShadowBlur(e.target.value);
									}}
									css={`
										max-width: 40px;
									`}
								/>

								<input
									type="number"
									value={shadowOffsetX}
									onChange={(e) => {
										setShadowOffsetX(e.target.value);
									}}
									css={`
										max-width: 40px;
									`}
								/>

								<input
									type="number"
									value={shadowOffsetY}
									onChange={(e) => {
										setShadowOffsetY(e.target.value);
									}}
									css={`
										max-width: 40px;
									`}
								/>
							</HorizontalFlex>
						</HeaderedSection>
					</Stack>
				)}
			</HeaderedSection>

			<button
				css={`
					flex: none;
					align-self: flex-end;

					border: solid 1px #274060;
					border-radius: 4px;
					padding: 6px 12px;

					background: #274060;
					color: #ffffff;

					cursor: pointer;

					&:hover {
						background: #1b2845;
						color: #ebfaff;
					}
				`}
				onClick={() => {
					navigator.clipboard.writeText(imgData);
				}}
			>
				Copy Image Data
			</button>
		</Stack>
	);
}

function HeaderedSection({ header, children }) {
	return (
		<section>
			<header
				css={`
					color: #333;
					font-size: 10pt;
					margin-bottom: 4px;
				`}
			>
				{header}
			</header>
			{children}
		</section>
	);
}
