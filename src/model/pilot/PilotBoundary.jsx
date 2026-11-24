import { Component } from 'react';
export default class PilotBoundary extends Component {
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  componentDidCatch(error){console.error('Pilot asset failed to load or retarget',error);}
  render(){return this.state.failed?null:this.props.children;}
}
