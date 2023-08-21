/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import GameView from "./GameView";
import { playerSocket } from "./service/ConnectSocket";
import "./TabLocal.css"
import GameWorld from './components/GameWorld/GameWorld';
import SelectPlayer from './components/customSelect/SelectPlayer';

const Tabs = ({ playerName, movedPlayer }) => {
  // { vert: [ {}, [Object], [Object], [Object] ] },

  //for local testing
  // const thevals = [{"vert": [movedPlayer]}];

  const [tabContent, setTabContent] = useState([]);
  const [playerValues, setPlayerValues] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [isContentAvailable, setIsContentAvailable] = useState(false);
  const [isPlayerValuesAvailable, setIsPlayerValuesAvailable] = useState(false);

  const gameViewRef = useRef();

  const handleSpriteRequestToPlayer = (sendingPlayer, spriteName) => {
    playerSocket.emit('spriteRequest', playerName, spriteName, sendingPlayer);
  }

  // for local testing

  // useEffect(() => {
  //   console.log("the data in test", thevals);
  //   if(thevals != null){
  //     getActivePlayerTab(thevals);
  //     setPlayerValues(thevals);
  //     setIsPlayerValuesAvailable(true);
  //   }

  // }, [movedPlayer])



  const handleTabClick = (tab) => {
    setActiveTab(tab);
    const content = playerValues?.find((item) => Object.keys(item)[0] === tab);
    if (content) {
      setTabContent(content[tab]);
      setIsContentAvailable(true);
    } else {
      setTabContent([]);
      setIsContentAvailable(false);
    }
  };
  
  const getActivePlayerTab = (playerValues) => {
    const val = Object.keys(playerValues?.[0])?.[0];
    setActiveTab(val);
    const content = playerValues?.find((item) => Object.keys(item)[0] === val);
    setTabContent(content[val]);
    setIsContentAvailable(true);
  }
  useEffect(() => {
    // Listen for playerValues events from other players
    playerSocket.on('playerValues', data => {
      console.log("the dta", data);
      getActivePlayerTab(data);
      setPlayerValues(data);
      setIsPlayerValuesAvailable(true);
    });
  }, [playerSocket]);

  return (
    <div>
      <div>
      {!isContentAvailable && <div className='content'> <GameView /></div>}
      {isContentAvailable &&       
      <div id="remoteGameBox" ref={gameViewRef}>
        <GameWorld>
          <GameView playerId={activeTab}  playerObjects={tabContent} gameViewRef={gameViewRef}/>
         </GameWorld>
      </div>
      }
      </div>
      {!isPlayerValuesAvailable && <div> <h4> Player tabs would show here when other players start playing. </h4> </div>}
      {isPlayerValuesAvailable &&       
      <div className="tabs">
        {playerValues?.map((item) => {
          if(Object.prototype.hasOwnProperty.call(item, playerName)){
            return;
          }
          const tabTitle = Object.keys(item).filter(key => key !== playerName)[0];
          return (
            <div
              key={tabTitle}
              className={`tab ${activeTab === tabTitle ? 'active' : ''}`}
              onClick={() => handleTabClick(tabTitle)}
            >
              {tabTitle}
            </div>
          );
        })}
      </div>
      }
        <div>
          <h2>Request shapes from players</h2>
          <SelectPlayer playerObject={playerValues} handleRequest={handleSpriteRequestToPlayer} playerName={playerName}/>
        </div>
    </div>
  );
};

export default Tabs;

Tabs.propTypes = {
  playerName: PropTypes.string
}
