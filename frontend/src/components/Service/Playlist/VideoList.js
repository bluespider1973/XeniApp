import React, { useEffect, useState } from 'react';

export default (props) => {
  const [id, setId] = useState(undefined);
  
  useEffect(() => {
    setId(props.match.params.playlist_id);

  }, [props])

  return (
    <h2>{id}</h2>
  )
}
