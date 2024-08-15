import kind from '@enact/core/kind';
import Panels from '@enact/sandstone/Panels';
import ThemeDecorator from '@enact/sandstone/ThemeDecorator';

// @ts-ignore
import css from './App.module.less';
import SoundModeApp from "../components/SoundModeApp";

const App = kind({
    name: 'App',

    styles: {
        css,
        className: 'app'
    },

    render: (props) => (
        <div {...props}>
            <Panels>
                <SoundModeApp/>
            </Panels>
        </div>
    )
});

export default ThemeDecorator(App);
