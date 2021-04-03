import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { palette } from '../palette';
import { Stack, HorizontalFlex, FlexInput, NoFlex } from './LayoutHelpers';
import { FontPreview } from './FontPreview';
import { ColorPicker } from './ColorPicker';
import { SmoothingInput } from './SmoothingInput';

const DynamicFontPicker = dynamic(() => import('font-picker-react'), {
	ssr: false,
});

export function Editor() {
	const colors = useMemo(() => palette.slice(1), []);

	const [backgroundColor, setBackgroundColor] = useState(palette[15]);
	const [color, setColor] = useState(palette[5]);

	const [fontMode, setFontMode] = useState('web');

	const [localFontFamily, setLocalFontFamily] = useState(
		'Luminari, Monotype Corsiva'
	);
	const [webFontFamily, setWebFontFamily] = useState('Audiowide');

	const [renderedFontFamily, setRenderedFontFamily] = useState();
	const [fontSize, setFontSize] = useState('28');

	const [lineSpacing, setLineSpacing] = useState('4');
	const [smoothing, setSmoothing] = useState(true);

	const [text, setText] = useState('RoboMan\n 20XX');

	const [originX, setOriginX] = useState(5);
	const [originY, setOriginY] = useState(5);

	const [outline, setOutline] = useState(true);
	const [outlineColor, setOutlineColor] = useState(palette[2]);
	const [outlineThickness, setOutlineThickness] = useState(7);

	const [shadow, setShadow] = useState(true);
	const [shadowColor, setShadowColor] = useState(palette[10]);
	const [shadowBlur, setShadowBlur] = useState(3);
	const [shadowOffsetX, setShadowOffsetX] = useState(3);
	const [shadowOffsetY, setShadowOffsetY] = useState(3);

	const [imgData, setImgData] = useState('');

	useEffect(() => {
		if (fontMode === 'local') {
			setRenderedFontFamily(localFontFamily);
		} else {
			// wait for web font to load before updating rendered font
			let cancelled = false;
			document.fonts
				.load(`${fontSize}px ${webFontFamily}`)
				.then(() => {
					if (!cancelled) {
						setRenderedFontFamily(webFontFamily);
					}
				})
				.catch(() => {
					console.error(`Failed loading font: ${webFontFamily}`);
				});
			return () => {
				cancelled = true;
			};
		}
	}, [fontMode, localFontFamily, webFontFamily]);

	return (
		<div
			css={`
				display: grid;
				grid-template-columns: auto 1fr;
				grid-row-gap: 8px;
				grid-column-gap: 32px;
				grid-template-rows: auto 1fr;

				max-width: 1000px;

				@media (max-width: 990px) {
					grid-template-columns: 1fr;
					max-width: 512px;
				}
			`}
		>
			<FontPreview
				originX={originX}
				originY={originY}
				text={text}
				font={renderedFontFamily}
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

			<Stack
				spacing={16}
				css={`
					grid-row-end: span 2;
				`}
			>
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

				<Stack spacing={8}>
					<HorizontalFlex spacing={8}>
						<Option
							name="local"
							label="Local fonts"
							selected={fontMode}
							onSelected={setFontMode}
						/>
						<Option
							name="web"
							label="Web fonts"
							selected={fontMode}
							onSelected={setFontMode}
						/>
					</HorizontalFlex>

					<HeaderedSection header="Font">
						<HorizontalFlex spacing={8}>
							{fontMode === 'local' ? (
								<FlexInput
									type="text"
									value={localFontFamily}
									onFocus={(e) => e.target.select()}
									onChange={(e) => setLocalFontFamily(e.target.value)}
								/>
							) : (
								<DynamicFontPicker
									apiKey="AIzaSyBrHC9D2gKwr4UauoE_r3saHfYrgz5g5cA"
									limit="350"
									activeFontFamily={webFontFamily}
									onChange={(nextFont) => {
										setWebFontFamily(nextFont.family);
									}}
								/>
							)}

							<NoFlex>
								<SmoothingInput value={smoothing} onChange={setSmoothing} />
							</NoFlex>
						</HorizontalFlex>
					</HeaderedSection>
				</Stack>

				<HeaderedSection header="Font Size / Line Spacing">
					<HorizontalFlex spacing={8}>
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
					</HorizontalFlex>
				</HeaderedSection>

				<HeaderedSection header="Origin X / Origin Y">
					<HorizontalFlex spacing={8}>
						<input
							type="number"
							value={originX}
							onChange={(e) => {
								setOriginX(e.target.value);
							}}
							css={`
								max-width: 80px;
							`}
						/>

						<input
							type="number"
							value={originY}
							onChange={(e) => {
								setOriginY(e.target.value);
							}}
							css={`
								max-width: 80px;
							`}
						/>
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
			</Stack>

			<div
				css={`
					justify-self: end;
				`}
			>
				<button
					css={`
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
			</div>
		</div>
	);
}

function Option({ name, label, selected, onSelected }) {
	return (
		<div>
			{selected === name ? (
				<b>{label}</b>
			) : (
				<button
					css={`
						background: transparent;
						padding: 0;
						margin: 0;
						border: none;

						cursor: pointer;

						color: #1f48a3;

						&:hover {
							text-decoration: underline;
						}
					`}
					onClick={() => {
						onSelected(name);
					}}
				>
					{label}
				</button>
			)}
		</div>
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
