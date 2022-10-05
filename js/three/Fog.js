import { Color } from '../../../../AAADisciplinas/CG/Three/three.js-r138/three.js-r138/src/math/Color.js';

class Fog {

	constructor( color, near = 1, far = 1000 ) {

		this.name = '';

		this.color = new Color( color );

		this.near = near;
		this.far = far;

	}

	clone() {

		return new Fog( this.color, this.near, this.far );

	}

	toJSON( /* meta */ ) {

		return {
			type: 'Fog',
			color: this.color.getHex(),
			near: this.near,
			far: this.far
		};

	}

}

Fog.prototype.isFog = true;

export { Fog };
