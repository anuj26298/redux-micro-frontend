import React from 'react';

export class AddTodo extends React.Component {

    constructor(props) {
        super(props);
        this.addTodo = this.addTodo.bind(this);
    }

    addTodo() {
        this.props.addTodo(this.description.value);
        this.description.value = '';
    }

    render() {
        return (
            <div className="addtodo">
                <label>Add Todo Object:</label>
                <input type='Text' placeholder="Enter Todo" ref={node => {
                    this.description = node;
                }}></input>
                <button className="todosubmit" onClick={this.addTodo}>Submit</button>
            </div>
        )
    }
}