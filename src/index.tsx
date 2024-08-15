import {createRoot, hydrateRoot} from 'react-dom/client';

import App from './App';
import reportWebVitals from './reportWebVitals';

const appElement = (<App />);

// In a browser environment, render instead of exporting
if (typeof window !== 'undefined') {
	const container = document.getElementById('root')!;

	// @ts-ignore
	if (ENACT_PACK_ISOMORPHIC) {
		hydrateRoot(container, appElement);
	} else {
		createRoot(container).render(appElement);
	}
}

export default appElement;

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint.
// Learn more: https://github.com/enactjs/cli/blob/master/docs/measuring-performance.md
reportWebVitals();
