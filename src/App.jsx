import React from 'react';
import { 
  Route, 
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider
} from 'react-router-dom';


import './scss/main.scss';
import MainLayout from './components/pages/MainLayout';
import LandingPage from './components/pages/LandingPage';
import NotFound from './components/pages/NotFound';
// import Playground from './components/pages/Playground';
// import Projects from './components/pages/Projects';
// import AboutRecipe from './components/pages/AboutRecipe';
// import Recipe from './components/pages/Recipe';
import WorldMap from './components/pages/WorldMap';
import Multiplcation from './components/pages/MultiplicationTables';
import ViolinPractice from './components/pages/practice/ViolinPractice';
import PianoPractice from './components/pages/practice/PianoPractice';
import ViolaPractice from './components/pages/practice/ViolaPractice';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<MainLayout/>}>
      <Route index element={<LandingPage/>} />
      {/* <Route path='/recipe' element={<Recipe/>} /> */}
      {/* <Route path='/projects' element={<Projects/>} /> */}
      <Route path='/multiplication' element={<Multiplcation/>} />
      <Route path='/world-map' element={<WorldMap/>} />
      <Route path='/practice/violin' element={<ViolinPractice/>} />
      <Route path='/practice/piano' element={<PianoPractice/>} />
      <Route path='/practice/viola' element={<ViolaPractice/>} />
      <Route path='*' element={<NotFound/>} />
    </Route>)
)

const App = () => {
  return <RouterProvider router={router}/>
}

export default App