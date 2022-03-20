import { Component, CSSProperties } from "react";

interface AsideProps {
    readonly style?: CSSProperties;
}
interface AsideState {}
export default class Aside extends Component<AsideProps, AsideState> {
    render = () => {
        return <aside className="Aside"></aside>;
    };
}
