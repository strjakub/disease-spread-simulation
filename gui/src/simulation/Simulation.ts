import Phaser from 'phaser'
import GridEngine from 'grid-engine'
import Scene from './scene/Scene'
import { MapData } from '../App'

export interface SimulationData {
    game: Phaser.Game
    scene: Scene
}

export const startSimulation = (
    data: MapData,
    numberOfPlayers: number,
    timeOfSimulation: number,
    probabilityOfInfection: number,
    probabilityOfInfectionAtTheBeginning: number,
    recoveryTime: number,
    recoveryTimeDispersion: number,
    immunityTime: number,
    immunityTimeDispersion: number,
    immunityRate: number,
    publicPlaceSpendingTime: number,
    publicPlaceSpendingTimeDispersion: number,
    privatePlaceSpendingTime: number,
    privatePlaceSpendingTimeDispersion: number,
    timeSpendingInHomeWhenIll: number,
    rangeOfDiseaseSpread: number,
    walkingSpeed: number,
    onStop: (avg: number, max: number) => void,
    setNumberOfIll: (n: number) => void,
    updateChart: (n: number) => void,
): SimulationData => {
    const scene = new Scene(
        data,
        numberOfPlayers,
        timeOfSimulation,
        probabilityOfInfection,
        probabilityOfInfectionAtTheBeginning,
        recoveryTime,
        recoveryTimeDispersion,
        immunityTime,
        immunityTimeDispersion,
        immunityRate,
        publicPlaceSpendingTime,
        publicPlaceSpendingTimeDispersion,
        privatePlaceSpendingTime,
        privatePlaceSpendingTimeDispersion,
        timeSpendingInHomeWhenIll,
        rangeOfDiseaseSpread,
        walkingSpeed,
        onStop,
        setNumberOfIll,
        updateChart,
    )

    const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        dom: {
            createContainer: true,
        },
        render: {
            antialias: false,
            pixelArt: true,
            powerPreference: 'high-performance',
        },
        backgroundColor: '#ffffff',
        height: '900',
        fps: { target: 30 },
        scale: {
            mode: Phaser.Scale.ScaleModes.NONE,
            autoCenter: Phaser.Scale.CENTER_VERTICALLY,
            autoRound: true,
        },
        parent: 'simulation-content',
        scene: scene,
        plugins: {
            scene: [
                {
                    key: 'gridEngine',
                    plugin: GridEngine,
                    mapping: 'gridEngine',
                },
            ],
        },
    }

    const game = new Phaser.Game(config)

    return {
        game,
        scene,
    }
}

export const stopSimulation = (simulationData: SimulationData): void => {
    simulationData.scene.sys.plugins.removeScenePlugin('gridEngine')
    simulationData.scene.sys.game.destroy(true)

    simulationData.game.plugins.removeScenePlugin('gridEngine')
    simulationData.game.destroy(true)
}
