import React, { useEffect, useState, useCallback } from 'react'
import Search from './components/Search'
import Spinner from './components/Spinner'
import MovieCard from './components/MovieCard'
import useDebounce from './hooks/useDebounce'
import { getPopularMovies, updateSearchTerm } from './appwrite'
const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const API_BASE_URL = 'https://api.themoviedb.org/3'
const API_OPTIONS = {
  method:'GET',
  headers: {
    accept: 'application/json',
    'Authorization': `Bearer ${API_KEY}`
  }
}

const App = () => {
  const [movieList, setMovieList] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const debouncedSearchTerm = useDebounce(searchTerm, 1000);

  const fetchMovies = useCallback(async (query = '', pageNum = 1) => {
    setIsLoading(true);
    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=${pageNum}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc&page=${pageNum}`;
      const response = await fetch(endpoint, API_OPTIONS);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.total_results === 0) {
        setErrorMessage('No movies found');
        setMovieList([]);
      } else {
        setMovieList(prevList => pageNum === 1 ? data.results : [...prevList, ...data.results]);
        setTotalPages(data.total_pages);
        setErrorMessage('');
        if(query && data.results.length > 0) {
            await updateSearchTerm(query, data.results[0]);
        }
      }
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage('Error fetching movies. Please try again later.');
      setMovieList([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadTrendingMovies = async () => {
    try {
      const movies = await getPopularMovies(5);
      setTrendingMovies(movies);
    } catch (error) {
      console.error(error);
    }
  }
  useEffect(() => {
    setPage(1);
    fetchMovies(debouncedSearchTerm, 1);
  }, [debouncedSearchTerm, fetchMovies]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  const loadMore = () => {
    if (page < totalPages) {
      setPage(prevPage => prevPage + 1);
      fetchMovies(debouncedSearchTerm, page + 1);
    }
  };
  return (
    <main>
      <div className='pattern' />
      <div className='wrapper'>
        <header>
          <img src="./hero.png" alt="Hero Banner" />
          <h1>Find <span className='text-gradient'>Movies</span> You'll Enjoy Without the Hassle</h1>
          <Search 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        </header>
        {trendingMovies.length > 0 && (
          <section className='trending'>
            <h2>Trending Movies</h2>
            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={`https://image.tmdb.org/t/p/w185${movie.poster_url}`} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}
        <section className='all-movies'>
          <h2>All Movies</h2>
          {isLoading && page === 1 ? (<Spinner/>) :
          errorMessage ? (<p className='text-red-500'>{errorMessage}</p>) :
          (
            <>
              <ul>
                {movieList.map((movie) => (
                  <MovieCard key={movie.id} movie={movie}/>
                ))}
              </ul>
              {page < totalPages && (
                <button onClick={loadMore} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
                  {isLoading ? 'Loading...' : 'Load More'}
                </button>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  )
}

export default App
