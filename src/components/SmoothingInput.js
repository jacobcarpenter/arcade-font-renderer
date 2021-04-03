export function SmoothingInput({ value, onChange }) {
	return (
		<label>
			<input
				type="checkbox"
				checked={value}
				onChange={(e) => {
					onChange(e.target.checked);
				}}
			/>{' '}
			Smoothing
		</label>
	);
}
