import _ from 'lodash';

import { h, Component } from 'preact'; //eslint-disable-line

import ZoneGroupActions from '../actions/ZoneGroupActions';

import ZoneGroupMember from './ZoneGroupMember';

class ZoneGroup extends Component {
    render() {
        const items = this.props.group;
        const playStates = this.props.playStates;
        let playState;

        if (!items) {
            return null;
        }

        const coordinator = _(items).find({
            coordinator: 'true'
        });

        if (coordinator) {
            playState = playStates[coordinator.host] || {};
        }

        const zoneNodes = items.map(function(item, index) {
            return <ZoneGroupMember member={item} key={index} />;
        });

        let currentPlayStateNode = <div className="play-state" />;

        if (playState && playState.track && playState.track.title) {
            const icon = playState.isPlaying
                ? <i className="material-icons">play_arrow</i>
                : <i className="material-icons">pause</i>;
            let info = playState.track.title;

            if (playState.track.artist) {
                info = info + ' - ' + playState.track.artist;
            }

            currentPlayStateNode = (
                <div className="play-state">
                    {icon} {info}
                </div>
            );
        }

        let classString = 'not-selected';

        if (
            this.props.currentZone &&
            coordinator &&
            coordinator.uuid === this.props.currentZone.uuid
        ) {
            classString = 'selected';
        }

        classString += ' zone-group';

        return (
            <div className={classString} onClick={this._onClick.bind(this)}>
                <ul>
                    {zoneNodes}
                </ul>

                <div
                    className="group-button"
                    onClick={this._showGroupManagement.bind(this)}
                >
                    Group
                </div>

                {currentPlayStateNode}
            </div>
        );
    }

    _onClick() {
        ZoneGroupActions.selectGroup(this.props.group);
    }

    _showGroupManagement(e) {
        ZoneGroupActions.showManagement(this.props.group);
        e.preventDefault();
        e.stopPropagation();
    }
}

export default ZoneGroup;
