import React, { Component } from 'react';
import Particles from "react-tsparticles";
import Navigation from './components/navigation/Navigation';
import Logo from './components/logo/Logo';
import ImageLinkForm from './components/imageform/ImageLinkForm';
import Rank from './components/rank/Rank';
import FaceRecognition from './components/facerecognition/FaceRecognition';
import SignIn from './components/signin/SignIn';
import Register from './components/register/Register';
import './App.css';


class App extends Component{
  constructor() {
    super();
    this.state = {
      input: '',
      imageUrl: '',
      box: {},
      route: 'signin',
      isSignIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: new Date()
      }
    }
  }

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }

calculateFaceLocation = (data) => {
    const face = data.outputs[0].data.regions[0].region_info.bounding_box;
    const img = document.getElementById('inputimage')
    const width = Number(img.width);
    const height = Number(img.height);

    // return an object that fills the box
    return {
      leftCol: face.left_col * width,
      topRow:  face.top_row * height,
      rightCol: width - (face.right_col * width),
      bottomRow: height - (face.bottom_row * height)
    }
  }

displayFaceBox = (box) => {
    this.setState({box: box});
}

onInputChange = (e) => {
  this.setState({input: e.target.value});
}

onSubmit = () => {
  this.setState({imageUrl: this.state.input});

  fetch('https://my-smart-brain-pro.herokuapp.com/imageurl', {
    method: 'post',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      input: this.state.input,
    })
  })
  .then(response => response.json())
  .then(response => {
    if (response && this.calculateFaceLocation(response) !== undefined) {
      fetch('https://my-smart-brain-pro.herokuapp.com/image', {
        method: 'put',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          id: this.state.user.id,
        })
      })
      .then(response => response.json())
      .then(count => {
        this.setState(Object.assign(this.state.user, {entries : count}))
      })
      this.displayFaceBox(this.calculateFaceLocation(response))
    }
  })
  .catch(error => console.log(error));
}

onRouteChange = (route) => {
  if (route === 'signout') {
    this.setState({isSignIn: false});
  } else if (route == 'home') {
    this.setState({isSignIn: true});
  }
  this.setState({route : route});
}


render() {
    const { isSignIn, imageUrl, route, box } = this.state;
  return (
    <div className="App">
      <Particles
      options={{
        fpsLimit: 100,
        interactivity: {
          events: {
            onClick: {
              enable: true,
              mode: "push",
            },
            onHover: {
              enable: true,
              mode: "repulse",
            },
            resize: true,
          },
          modes: {
            bubble: {
              distance: 400,
              duration: 2,
              opacity: 0.8,
              size: 40,
            },
            push: {
              quantity: 4,
            },
            repulse: {
              distance: 200,
              duration: 0.4,
            },
          },
        },
        particles: {
          color: {
            value: "#ffffff",
          },
          links: {
            color: "#ffffff",
            distance: 150,
            enable: true,
            opacity: 0.3,
            width: 1,
          },
          collisions: {
            enable: true,
          },
          move: {
            direction: "none",
            enable: true,
            outMode: "bounce",
            random: false,
            speed: 2,
            straight: false,
          },
          number: {
            density: {
              enable: true,
              area: 800,
            },
            value: 80,
          },
          opacity: {
            value: 0.2,
          },
          shape: {
            type: "circle",
          },
          size: {
            random: true,
            value: 5,
          },
        },
        detectRetina: true,
      }}
    />
        <Navigation onRouteChange={this.onRouteChange} isSignIn={isSignIn}  />
        { route === 'home'
          ? <div>
              <Logo />
              <Rank
                name={this.state.user.name}
                entries={this.state.user.entries}
              />
              <ImageLinkForm
                onInputChange={this.onInputChange}
                onSubmit={this.onSubmit}
              />
              <FaceRecognition box={box} imageUrl={imageUrl} />
            </div>
          : (
             (route === 'signin' || route === 'signout')
             ? <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
             : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
            )
        }
    </div>
  );
}

}

export default App;
