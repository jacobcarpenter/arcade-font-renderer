export function ColorPicker({ colors, selectedColor, onChange }) {
	return (
		<div>
			{colors.map((color) => (
				<button
					key={color}
					onClick={() => onChange(color)}
					css={`
						cursor: pointer;
						border: 2px solid
							${selectedColor === color ? 'blue' : 'transparent'};
						background-color: transparent;
						padding: 2px;
						outline: none;
					`}
				>
					<div
						css={`
							border: solid 1px #ddd;
							width: 20px;
							height: 20px;
						`}
						style={{ backgroundColor: color }}
					></div>
				</button>
			))}
		</div>
	);
}
