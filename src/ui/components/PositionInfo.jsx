"use strict";

import moment from 'moment';
import React from 'react';

import _ from 'lodash';

import PlayerActions from '../actions/PlayerActions';
import PlayerStore from '../stores/PlayerStore';

function formatTime(d) {
	return `${_.padLeft(((d.hours() * 60) + d.minutes()), 2, '0')}:${_.padLeft(d.seconds(), 2, '0')}`;
}

class PositionInfo extends React.Component {

	constructor () {
		super();
		this.state = {
			isPlaying: false,
			playMode: 'NORMAL',
			isCrossfade: false,
			info: null,
			offset: 0,
		};

		this._interval = null;
	}

	componentDidMount () {
		PlayerStore.addChangeListener(this._onChange.bind(this));
	}

	componentWillUnmount () {
		this.cleanInterval();
	}

	startInterval ()  {
		this._interval = window.setInterval(this._onInterval.bind(this), 1000);
	}

	cleanInterval ()  {
		if(this._interval) {
			window.clearInterval(this._interval);
		}
		this._interval = null;
	}

	_toggleRepeat () {
		let newMode;

		if(this.state.playMode === 'NORMAL') {
			PlayerActions.setPlayMode('REPEAT_ALL');
		}

		if(this.state.playMode === 'REPEAT_ALL') {
			PlayerActions.setPlayMode('REPEAT_ONE');
		}

		if(this.state.playMode === 'REPEAT_ONE') {
			PlayerActions.setPlayMode('NORMAL');
		}

		if(this.state.playMode === 'SHUFFLE') {
			PlayerActions.setPlayMode('SHUFFLE_REPEAT_ONE');
		}

		if(this.state.playMode === 'SHUFFLE_REPEAT_ONE') {
			PlayerActions.setPlayMode('SHUFFLE_NOREPEAT');
		}

		if(this.state.playMode === 'SHUFFLE_NOREPEAT') {
			PlayerActions.setPlayMode('SHUFFLE');
		}
	}

	_toggleShuffle () {
		if(this.state.playMode === 'NORMAL') {
			PlayerActions.setPlayMode('SHUFFLE_NOREPEAT');
		}

		if(this.state.playMode === 'REPEAT_ALL') {
			PlayerActions.setPlayMode('SHUFFLE');
		}

		if(this.state.playMode === 'REPEAT_ONE') {
			PlayerActions.setPlayMode('SHUFFLE_REPEAT_ONE');
		}

		if(this.state.playMode === 'SHUFFLE') {
			PlayerActions.setPlayMode('REPEAT_ALL');
		}

		if(this.state.playMode === 'SHUFFLE_REPEAT_ONE') {
			PlayerActions.setPlayMode('REPEAT_ONE');
		}

		if(this.state.playMode === 'SHUFFLE_NOREPEAT') {
			PlayerActions.setPlayMode('NORMAL');
		}
	}

	_toggleCrossfade () {
		PlayerActions.setCrossfade(!this.state.isCrossfade);
	}

	_onChange () {
		let info = PlayerStore.getPositionInfo();
		let isPlaying = PlayerStore.isPlaying()
		let playMode = PlayerStore.getPlayMode()
		let isCrossfade = PlayerStore.isCrossfade()
		let offset = this.state.offset;

		this.setState({
			isPlaying,
			playMode,
			isCrossfade,
		});

		if(info !== this.state.info) {
			this.cleanInterval()

			this.setState({
				info: info,
				offset: 0,
			});

			this.startInterval();
		}
	}

	_onInterval () {
		if(this.state.isPlaying) {
			this.setState({
				offset: this.state.offset + 1
			});
		}
	}

	_onClick (e) {

		let info = this.state.info;

		if(!info || !info.TrackDuration) {
			return;
		}

		let element = e.target;
		let rect = element.getBoundingClientRect();
		let left = e.clientX - Math.floor(rect.left);

		let d = info.TrackDuration.split(':');
		let totalSeconds = (Number(d[0]) * 60 * 60) + (Number(d[1]) * 60) + Number(d[2]);

		let percent = 100 / rect.width * left;
		let time = Math.floor(totalSeconds / rect.width * left);

		PlayerActions.seek(time)
	}

	render () {

		let info = this.state.info;
		let offset = this.state.offset || 0;
		let percent = 0;
		let fromStr = '00:00';
		let toStr = '-00:00';

		if(info) {
			let start = moment.duration();
			let now = moment.duration(info.RelTime).add(offset, 's');
			let end = moment.duration(info.TrackDuration);

			if(end.asSeconds() > 0) {
				if(now > end) {
					now = moment.duration(info.TrackDuration);
					PlayerActions.refreshPosition()
				}

				let to = moment.duration(end.asSeconds(), 'seconds').subtract(now.asSeconds(), 's');

				toStr = `-${formatTime(to)}`;
				percent = 100 / end.asSeconds() * now.asSeconds();
			}

			fromStr = `${formatTime(now)}`;
		}

		let styles = {
			left: String(Math.round(percent)) + '%'
		};

		let repeat = <i className="material-icons repeat">repeat</i>;
		let shuffle = <i className="material-icons shuffle">shuffle</i>;

		switch(this.state.playMode) {
			case 'NORMAL':
				break;

			case 'SHUFFLE':
			case 'REPEAT_ALL':
				repeat = <i className="material-icons repeat active">repeat</i>;
				break;

			case 'REPEAT_ONE':
			case 'SHUFFLE_REPEAT_ONE':
				repeat = <i className="material-icons repeat active">repeat_one</i>;
				break;
		}

		switch(this.state.playMode) {
			case 'SHUFFLE':
			case 'SHUFFLE_NOREPEAT':
			case 'SHUFFLE_REPEAT_ONE':
				shuffle = <i className="material-icons shuffle active">shuffle</i>;
				break;
		}

		let crossfade = <i className="material-icons crossfade">import_export</i>;

		if(this.state.isCrossfade) {
			crossfade = <i className="material-icons crossfade active">import_export</i>;
		}

		return (
			<div id="position-info">
				<img className="left" src="images/tc_progress_container_left.png" />
				<img className="right" src="images/tc_progress_container_right.png" />
				<div className="content">
					<a onClick={this._toggleRepeat.bind(this)}>{repeat}</a>
					<a onClick={this._toggleShuffle.bind(this)}>{shuffle}</a>
					<a onClick={this._toggleCrossfade.bind(this)}>{crossfade}</a>

					<span id="countup">{fromStr}</span>
					<div id="position-info-control">
						<div id="position-bar" onClick={this._onClick.bind(this)}>
							<div id="position-bar-scrubber" style={styles}></div>
						</div>
					</div>
					<span id="countdown">{toStr}</span>
				</div>

			</div>
		);
	}
}

export default PositionInfo;
