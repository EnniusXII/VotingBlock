import { RouterProvider } from 'react-router-dom'
import { router } from './Router'
import './styles/globals/globals.css'

function App() {

  return (
    <>
    <RouterProvider router={router} />
    </>
  )
}

export default App
