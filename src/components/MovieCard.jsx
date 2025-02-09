import React from 'react'

const PROJECT_PATH = import.meta.env.BASE_URL
const MovieCard = ({movie:{ title, vote_average, release_date, original_language, poster_path }}) => {
  return (
    <div className='movie-card'>
      {/* <p className='text-white'> {title} </p> */}
      <img src={poster_path ? `https://image.tmdb.org/t/p/w500/${poster_path}` :
      `${PROJECT_PATH}no-movie.png`} alt={title}/>
      <div className="mt-4">
        <h3>{title}</h3>
        <div className="content">
            <div className="rating">
                <img src="star.svg" alt="Star Icon" />
                <p> {vote_average ? vote_average.toFixed(1) : 'N/A'} </p>
                <span>•</span>
                <p className="lang">{original_language}</p>
                <span>•</span>
                <p className="year">{release_date ? new Date(release_date).getFullYear() : 'N/A' }</p>
            </div>
        </div>
      </div>
    </div>
  )
}

export default MovieCard
