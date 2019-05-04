import React, { useState, useEffect } from 'react'

import {
  Typography,
} from '@material-ui/core'

function GameStartCountdown({ count }) {
  const [remain, setRemain] = useState(count)

  useEffect(() => {
    let refId = null
    if (remain > 0) {
      refId = setTimeout(() => {
        setRemain(remain - 1)
      }, 1000)
    }
    return () => { clearTimeout(refId) }
  }, [remain])

  if (remain <= 0) {
    return <div />
  }

  return (
    <div>
      <Typography component="span" variant="caption" style={{ display: 'inline-block' }}>
        次のハンド開始まであと
        <Typography component="span" variant="body1" style={{ display: 'inline-block' }}>
          {remain}
        </Typography>
        秒
      </Typography>
    </div>
  )
}

export default GameStartCountdown