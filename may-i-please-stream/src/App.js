import {useState} from 'react';
// import {useEffect} from 'react';

export default function App() {
  const [services, setServices] = useState(Array(7).fill(false));
  const [data, setData] = useState([{"title":"Use the search bar above","services":""}]);
  // const [search, setSearch] = useState("");

  function handleTickboxCheck(i) {
    var newServices = services.slice(); 
    var a = 1;
    newServices[i] = !newServices[i];
    setServices(newServices);
    console.log(newServices); 
  }


  function onSubmit(event) {
    event.preventDefault();
    // Using fetch to fetch the api from
    // flask server it will be redirected to proxy

    if (event.target[0].value === "") {
      alert("Please enter a director name");
      return;
    }
    if(services.every((val, i, arr) => val === false)){
      alert("Please select at least one service");
      return;
    }
    setData([{"title":"Loading...","services":""}]);

    fetch("/test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        search: event.target[0].value,
        services: services,
      }),

    }).then((res) =>
        res.json().then((jsondata) => {
            // Setting a data from api
            setData(jsondata);
            console.log(jsondata);

        }).catch((err) => {
            console.log(err);
        })
    );
    console.log("Submitted!");
  }

  return (
    <>  
    <div className="app-frame">
      <div className="header">
        <h2 className='title'>May I Please Stream?</h2>
        <SearchBar handleSubmit = {onSubmit}/>
        <h3 className='title'> Services</h3>
        <ServiceCheckbox service="Netflix"      handleTickboxCheck={() => handleTickboxCheck(0)}/>
        <ServiceCheckbox service="Filmstriben"  handleTickboxCheck={() => handleTickboxCheck(1)}/> 
        <ServiceCheckbox service="Disney+"  handleTickboxCheck={() => handleTickboxCheck(2)}/> 
        <ServiceCheckbox service="HBO MAX"      handleTickboxCheck={() => handleTickboxCheck(3)}/> 
        <ServiceCheckbox service="Prime Video"  handleTickboxCheck={() => handleTickboxCheck(4)}/> 
        <ServiceCheckbox service="Sky Showtime"  handleTickboxCheck={() => handleTickboxCheck(5)}/> 
        <ServiceCheckbox service="Viaplay"      handleTickboxCheck={() => handleTickboxCheck(6)}/> 
      </div>
    <div className="results-frame">
      <h3 className='title'>Results</h3>
      <div className="results">
        {data.map(function (item, i){
          if(item){
            return <Result name={item["title"]} services={item["services"]} />
          }
        })}
      </div>
    </div>
    </div>
    </>
  );
}

function Result({name, services}) {
  return (
  <>  
  <div>
    {name}
  </div>
  <div>
    {services}
  </div></>);
}      

function SearchBar({handleSubmit}) {

  return (
    <>
    <form className="search-bar" onSubmit={handleSubmit}>
    <div >
      <input type="text" placeholder="Search for director..." />
    </div>
    <input type="submit" value="Submit" />
    </form>
    </>
  );
}

function ServiceCheckbox({service, handleTickboxCheck}) {
  // const [checked, setChecked] = useState(false);
  return (
    
    <div className="serviceCheckbox">
      <label>
      <input 
        type="checkbox"
        onChange={handleTickboxCheck}
        /> 
      {service}
      </label>
      
      
    </div>
  );
}

