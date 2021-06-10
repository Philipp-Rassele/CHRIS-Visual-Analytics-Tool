import React from "react";
import { Slider, Rail, Handles, Ticks } from 'react-compound-slider';


function SliderCustom(props){
    const sliderStyle = {  // Give the slider some width
        position: 'relative',
        width: '100%',
        height: 40,
        // border: '1px solid steelblue',
    }
    
    const railStyle = {
        position: 'absolute',
        width: '100%',
        height: 5,
        marginTop: 7.5,
        borderRadius: 5,
        backgroundColor: 'lightgray',
    }

    function Handle({
        handle: { id, value, percent },
        getHandleProps
        }) {
        return (
            <div
                style={{
                    left: `${percent}%`,
                    position: 'absolute',
                    marginLeft: -10,
                    marginTop: 0,
                    zIndex: 2,
                    width: 20,
                    height: 20,
                    cursor: 'pointer',
                    borderRadius: '50%',
                    backgroundColor: '#007bff',
                }}
                {...getHandleProps(id)}
            />
        )
      }

    function Tick({ tick, count }) {
        return (
            <div>
                <div
                    style={{
                    position: 'absolute',
                    marginTop: 20,
                    marginLeft: -0.5,
                    width: 1,
                    height: 5,
                    backgroundColor: 'silver',
                    left: `${tick.percent}%`,
                    }}
                />
                <div
                    style={{
                    position: 'absolute',
                    marginTop: 23,
                    fontSize: 10,
                    textAlign: 'center',
                    marginLeft: `${-(100 / count) / 2}%`,
                    width: `${100 / count}%`,
                    left: `${tick.percent}%`,
                    }}
                >
                    {tick.value}
                </div>
            </div>
        )
    }

    return(
        <div>
            <Slider
                rootStyle={sliderStyle /* inline styles for the outer div. Can also use className prop. */}
                domain={[1, 12]}
                values={[props.value]}
                step={1}
                onSlideEnd={(e) => {props.updateInteractiveFigureSize(e[0])}}
            >
                <Rail>
                    {({ getRailProps }) => (
                        <div style={railStyle} {...getRailProps()} />
                    )}
                </Rail>
                <Handles>
                    {({ handles, getHandleProps }) => (
                        <div className="slider-handles">
                        {handles.map(handle => (
                            <Handle
                            key={handle.id}
                            handle={handle}
                            getHandleProps={getHandleProps}
                            />
                        ))}
                        </div>
                    )}
                </Handles>
                <Ticks count={15 /* generate approximately 15 ticks within the domain */}>
                    {({ ticks }) => (
                        <div className="slider-ticks">
                        {ticks.map(tick => (
                            <Tick key={tick.id} tick={tick} count={ticks.length} />
                        ))}
                        </div>
                    )}
                </Ticks>
            </Slider>
        </div>
    );
}

export default SliderCustom;