import React, { createContext } from 'react'
import ReactDOM from 'react-dom'

const AppContext = createContext()

/** 手写实现useState */
const lastState = []
let index = 0
function useState(initialState) {
  lastState[index] = lastState[index] ?? initialState
  const currentIndex = index
  function setState(newState) {
    lastState[currentIndex] = newState
    render()
  }
  return [lastState[index++], setState]
}

/** 手写实现useMemo */
let lastMemo;
let lastMemoDependencies;
function useMemo(callback, dependencies) {
  if (lastMemoDependencies) {
    //看看新的依赖数组是不是每一项都跟老的依赖数组中的每一项都相同
    let changed = !dependencies.every((item, index) => {
      return item == lastMemoDependencies[index];
    });
    if (changed) {
      lastMemo = callback();
      lastMemoDependencies = dependencies;
    }
  } else {//没有渲染过
    lastMemo = callback();
    lastMemoDependencies = dependencies;
  }
  return lastMemo;
}

/** 手写实现useCallback */
let lastDependencies
let lastCallback
function useCallback(callback, dependencies = []) {
  if (lastDependencies) {
    let changed = !dependencies.every((item, index) => {
      console.log(item, lastDependencies[index])
      return item === lastDependencies[index]
    })
    if (changed) {
      lastCallback = callback
      lastDependencies = dependencies
    }
  } else {
    // lastDependencies还没有被赋值
    lastDependencies = dependencies
    lastCallback = callback
  }
  return lastCallback
}

const set = new Set()

/**
 手写一个useEffect
 接收一个回调函数和一个依赖数组
 当依赖数组中的值发生变化则执行calllback

  */
let lastEffectDependencies;
function useEffect(callback, dependencies) {
  if (!dependencies) {
    callback()
    return
  }
  if (lastEffectDependencies) {
    const isChanged = !dependencies.every((dep, index) => {
      return dep === lastEffectDependencies[index]
    })
    if (isChanged) {
      callback()
      lastEffectDependencies = dependencies
    }
  } else {
    // 初始化
    callback()
    lastEffectDependencies = dependencies
  }
}

/**
手写实现一个useReducer
接收一个
 */
let lastReducerState
function useReducer(reducer, initialState) {
  lastReducerState = lastReducerState ?? initialState
  function dispatch(action) {
    lastReducerState = reducer(lastReducerState, action)
    render()
  }
  return [lastReducerState, dispatch]
}


// useReducer测试
// 第一个参数：应用的初始化
const initialState = { superCount: 0 };

// 第二个参数：state的reducer处理函数
function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { superCount: state.superCount + 1 };
    case 'decrement':
      return { superCount: state.superCount - 1 };
    default:
      throw new Error();
  }
}

/** 手下实现useContext */
function useContext(context) {
  return context._currentValue
}

function Animation() {
  const [count, setCount] = useState(0)
  const [name, setName] = useState('李华')

  /** useMemo昂贵计算测试 */
  const expensive = useMemo(() => {
    console.log('compute');
    let sum = 0;
    for (let i = 0; i < count * 100; i++) {
      sum += i;
    }
    return sum;
  }, [count])

  /** useCallback每次渲染重新生成测试 */
  const callback = useCallback(() => {
    console.log(count)
  }, [count])
  set.add(callback)

  useEffect(() => {
    console.log('effect')
  }, [count])

  // useReducer测试
  const [state, dispatch] = useReducer(reducer, initialState)
  console.log(state)

  return (
    <AppContext.Provider value={{state, dispatch}}>
      <div>点击了${ count }次</div>
      <button onClick={ () => setCount(count + 1) }>加一</button>
      <button onClick={ () => setCount(count - 1) }>减一</button>
      <div>名字是{ name }</div>
      <button onClick={ () => setName('小白') }>更改名字为小白</button>
      <div>昂贵计算结果为{ expensive }</div>
      <div>set的长度为{ set.size }</div>
      <hr />
      <div>useReducer的state值{ state.superCount }</div>
      <button onClick={ () => dispatch({ type: 'increment' }) }>useReducer+1</button>
      <button onClick={ () => dispatch({ type: 'decrement' }) }>useReducer-1</button>
      <hr/>
      <Counter></Counter>
    </AppContext.Provider>
  )
}

function Counter() {
  const {state, dispatch} = useContext(AppContext)
  return (<>
    <div>
      <p>{state.superCount}</p>
      <button onClick={() => dispatch({type: 'increment'})}>点击加一</button>
    </div>
  </>)
}

function render() {
  index = 0
  ReactDOM.render(<Animation />, document.getElementById('root'))
}

render()