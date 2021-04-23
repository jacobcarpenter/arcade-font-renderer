export function LabeledCheckbox({ label, value, onChange }) {
	return (
		<label>
			<input
				type="checkbox"
				checked={value}
				onChange={(e) => {
					onChange(e.target.checked);
				}}
			/>{' '}
			{label}
		</label>
	);
}
