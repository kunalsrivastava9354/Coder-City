import { useState } from 'react'
import { Home } from './pages/Home'
import { CityScene } from './game/CityScene'
import type { CityUserData } from './services/api'

function App() {
  const [userData, setUserData] = useState<CityUserData | null>(null)

  const handleGenerate = (data: CityUserData) => {
    setUserData(data)
  }

  return (
    <>
      {userData ? (
        <CityScene
          userData={userData}
          onBack={() => {
            setUserData(null)
          }}
        />
      ) : (
        <Home onGenerate={handleGenerate} />
      )}
    </>
  )
}

export default App
