import styled, { css } from 'styled-components';

export const Stack = styled.div`
	display: flex;
	flex-direction: column;

	${({ spacing }) =>
		spacing &&
		css`
			> *:not(:first-child) {
				margin-top: ${spacing}px;
			}
		`}
`;

export const HorizontalFlex = styled.div`
	display: flex;
	align-items: baseline;

	${({ spacing }) =>
		spacing &&
		css`
			> *:not(:first-child) {
				margin-left: ${spacing}px;
			}
		`}
`;

export const FlexInput = styled.input`
	${({ grow = 1, shrink = 1, basis = 'auto' }) =>
		css`
			flex: ${grow} ${shrink} ${basis};
		`}
	min-width: 0;
`;

export const NoFlex = styled.div`
	flex: none;
`;
