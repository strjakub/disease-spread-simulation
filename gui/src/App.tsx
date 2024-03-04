import { useState } from 'react'
import './App.css'
import { startSimulation, stopSimulation } from './simulation/Simulation'
import axios from 'axios'
import simulationJSON from '../assets/simulation.json'

const RANDOM_MOVEMENT_SERVER_API_URL: string = import.meta.env
    .VITE_RANDOM_MOVEMENT_SERVER_API_URL as string
const ANALYTICS_SERVER_API_URL: string = import.meta.env
    .VITE_ANALYTICS_SERVER_API_URL as string
export const analyticsData: AnalData[] = []

export interface MapData {
    id: string,
    privateTiles: {
        x: number,
        y: number,
    }[],
    width: number,
    height: number,
}

export interface AnalData {
    noPeople: number,
    time: number,
    probabilityOfInfection: number,
    probabilityOfInfectionAtStart: number,
    avg: number,
    max: number,
}

const shuffle = (array: any[]) => {
    let currentIndex = array.length,  randomIndex;
  
    while (currentIndex > 0) {
  
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
}

const getCorrelation = () => {
    axios.post(`${ANALYTICS_SERVER_API_URL}/analysis`, JSON.stringify({data: analyticsData}) ,{
        headers: {
            'Content-Type': 'application/json'
          }
    })
    .then((response) => {
        console.log(response.data)
    })
    .catch((error) => {
        console.error(error)
    })
}

const App = () => {
    const [isSimulationOn, setIsSimulationOn] = useState<boolean>(false)
    const [numberOfIll, setNumberOfIll] = useState<number>(0)
    const [numberOfPlayers, setNumberOfPlayers] = useState<number>(200)
    const [timeOfSimulation, setTimeOfSimulation] = useState<number>(10)
    const [probabilityOfInfection, setProbabilityOfInfection] = useState<string>('0.2')
    const [probabilityOfInfectionAtTheBeginning, setProbabilityOfInfectionAtTheBeginning] = useState<string>('0.1')

    const start = async () => {
        const probabilityOfInfectionNumber = parseFloat(probabilityOfInfection)
        if (isNaN(probabilityOfInfectionNumber) || probabilityOfInfectionNumber < 0 || probabilityOfInfectionNumber > 1) {
            alert('Probability of infection must be a number between 0 and 1')
            return
        }
        const probabilityOfInfectionAtTheBeginningNumber = parseFloat(probabilityOfInfectionAtTheBeginning)
        if (isNaN(probabilityOfInfectionAtTheBeginningNumber) || probabilityOfInfectionAtTheBeginningNumber < 0 || probabilityOfInfectionAtTheBeginningNumber > 1) {
            alert('Probability of infection at the beginning must be a number between 0 and 1')
            return
        }

        await axios.post(`${RANDOM_MOVEMENT_SERVER_API_URL}/map`, simulationJSON ,{
            headers: {
                'Content-Type': 'application/json'
              }
        })
        .then((response) => {
            const data: MapData = response.data
            shuffle(data.privateTiles)
            const simulationData = startSimulation(
                data, 
                numberOfPlayers, 
                timeOfSimulation * 1000, 
                probabilityOfInfectionNumber, 
                probabilityOfInfectionAtTheBeginningNumber, 
                (avg: number, max: number) => {
                    analyticsData.push({
                        noPeople: numberOfPlayers,
                        time: timeOfSimulation,
                        probabilityOfInfection: probabilityOfInfectionNumber,
                        probabilityOfInfectionAtStart: probabilityOfInfectionAtTheBeginningNumber,
                        avg: avg,
                        max: max})
                    stopSimulation(simulationData!)
                    document.body.style.overflow = 'auto'
                    setIsSimulationOn(false)
                    setNumberOfPlayers(200)
                    setTimeOfSimulation(10)
                    setProbabilityOfInfection('0.2')
                    setProbabilityOfInfectionAtTheBeginning('0.1')
                    setNumberOfIll(0)
                },
                (n : number) => {
                    setNumberOfIll(n)
                })
            document.body.style.overflow = 'hidden'
            setIsSimulationOn(true)
        })
        .catch((error) => {
            console.error(error)
        })
    }

    return (
        <div style={{height: '100vh', width: '100vw'}}>
            <div id='simulation-content' style={{display: `${isSimulationOn ? 'flex' : 'none'}`}} className='w-100 h-100 flex-row-reverse'>
                <div className='flex-grow-1 d-flex flex-column justify-content-center align-items-center'>
                    <h1>Simulation</h1>
                    <p>Number of ill: <strong>{numberOfIll}</strong></p>
                </div>
            </div>
            <div id='simulation-form' style={{display: `${isSimulationOn ? 'none' : 'flex'}`}} className='m-auto w-25 h-100 flex-column justify-content-center align-items-center row-gap-2'>
                <h1>Simulation</h1>
                <div className='w-100 d-flex flex-column'>
                    <label htmlFor='numberOfPlayers'>Number of players</label>
                    <input id='numberOfPlayers' type='number' min={1} max={200} value={numberOfPlayers} onChange={(e) => {
                        setNumberOfPlayers(parseInt(e.target.value))
                    }}/>
                </div>
                <div className='w-100 d-flex flex-column'>
                    <label htmlFor='timeOfSimulation'>Time of simulation (in seconds)</label>
                    <input id='timeOfSimulation' type='number' min={1} max={1000000} value={timeOfSimulation} onChange={(e) => {
                        setTimeOfSimulation(parseInt(e.target.value))
                    }}/>
                </div>
                <div className='w-100 d-flex flex-column'>
                    <label htmlFor='ProbabilityOfInfection'>Probability of infection</label>
                    <input id='ProbabilityOfInfection' type='string' value={probabilityOfInfection} onChange={(e) => {
                        setProbabilityOfInfection(e.target.value)
                    }}/>
                </div>
                <div className='w-100 d-flex flex-column'>
                    <label htmlFor='ProbabilityOfInfectionAtTheBeginning'>Probability of infection at the beginning</label>
                    <input id='ProbabilityOfInfectionAtTheBeginning' type='string' value={probabilityOfInfectionAtTheBeginning} onChange={(e) => {
                        setProbabilityOfInfectionAtTheBeginning(e.target.value)
                    }}/>
                </div>
                <button className='pe-auto' onClick={start}>Start Simulation</button>
                <button className='pe-auto' onClick={getCorrelation}>Analyse Data</button>
            </div>
        </div>
    )
}

export default App
