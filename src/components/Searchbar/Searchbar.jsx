import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import NodeSelect from "./NodeSelect";
import Graph from "~/models/Graph";
import DistanceType from "./DistanceType";
import { searchGraph, clearAnswers, udpateAnswers } from "~/actions/controller";
import { COLORS, DANGER_COLOR } from "~/constants";

import styles from "./Searchbar.less";
import Footer from "./Footer";

class Searchbar extends React.Component {
	static getDerivedStateFromProps(props, state) {
		const selectedNodes = state.selectedNodes.filter(
			node => !!props.graph.nodes[node.name],
		);
		return { ...state, selectedNodes };
	}

	static getTransparentColor(color) {
		return `${color}0D`;
	}

	static renderNoFound(answer, index) {
		return (
			<div
				key={index}
				className="alert"
				style={{
					border: `1px solid #eeeeee`,
					borderLeft: `5px solid ${DANGER_COLOR}`,
				}}
			>
				No path from {answer.start} to {answer.end}{" "}
				<i
					className="fas fa-exclamation-circle"
					style={{ color: DANGER_COLOR }}
				/>
			</div>
		);
	}

	static renderFound(answer, index) {
		const color = COLORS[index];
		const pathInfo = answer.path.reduce((pthinf, node, j) => {
			const arr = pthinf;
			if (arr.length) {
				arr.push(
					<i
						key={`${j}arrow`}
						className="fas fa-caret-right"
						style={{ color: "#9E9E9E" }}
					/>,
				);
			}
			arr.push(<span key={j}>&nbsp;&nbsp;{node.name}&nbsp;&nbsp;</span>);
			return arr;
		}, []);
		return (
			<div
				key={index}
				className="alert"
				style={{
					border: `1px solid #eeeeee`,
					borderLeft: `5px solid ${color}`,
				}}
			>
				{pathInfo}
			</div>
		);
	}

	constructor(props) {
		super(props);
		this.state = this.getInitialState();
	}

	getInitialState() {
		return {
			selectedNodes: [],
		};
	}

	setSelectedNodes(selectedNodes) {
		this.setState({ selectedNodes });
		udpateAnswers(selectedNodes);
	}

	renderNodeSelect() {
		return (
			<NodeSelect
				options={this.props.graph.nodeArray}
				value={this.state.selectedNodes}
				onChange={value => {
					this.setSelectedNodes(value);
				}}
			/>
		);
	}

	renderSearchButton() {
		if (this.props.answers) return null;
		return (
			<button
				className="btn btn-light"
				disabled={this.state.selectedNodes.length < 2}
				onClick={() => {
					searchGraph(this.state.selectedNodes);
				}}
			>
				Search
			</button>
		);
	}

	renderClearNodeSelectButton() {
		if (this.props.answers) return null;
		return (
			<button
				className="btn btn-light ml-2"
				onClick={() => {
					this.setSelectedNodes([]);
				}}
				title={"Remove selected nodes"}
			>
				<i className="fas fa-times" />
			</button>
		);
	}

	renderClearAnswersButton() {
		if (!this.props.answers) return null;
		return (
			<button
				className="btn btn-light"
				onClick={() => {
					clearAnswers();
				}}
				title="Clear Search Results"
			>
				Clear
			</button>
		);
	}

	renderAnswers() {
		if (!this.props.answers) return null;
		const answersDOM = this.props.answers.map((answer, index) => {
			if (!answer.path) {
				return Searchbar.renderNoFound(answer, index);
			}
			return Searchbar.renderFound(answer, index);
		});
		return <div className="mt-4">{answersDOM}</div>;
	}

	renderDistanceType() {
		return (
			<DistanceType
				onChange={() => {
					udpateAnswers(this.state.selectedNodes);
				}}
			/>
		);
	}

	renderButtons() {
		return (
			<div className="mt-4">
				{this.renderSearchButton()}
				{this.renderClearNodeSelectButton()}
				{this.renderClearAnswersButton()}
			</div>
		);
	}

	render() {
		return (
			<nav id="searchbar" className={styles.searchbar}>
				{this.renderNodeSelect()}
				{this.renderDistanceType()}
				{this.renderButtons()}
				{this.renderAnswers()}
				<Footer />
			</nav>
		);
	}
}

Searchbar.propTypes = {
	graph: PropTypes.instanceOf(Graph).isRequired,
	answers: PropTypes.arrayOf(PropTypes.any),
};

const mapStateToProps = state => ({
	graph: state.graph,
	answers: state.answers,
});

export default connect(mapStateToProps, null)(Searchbar);
