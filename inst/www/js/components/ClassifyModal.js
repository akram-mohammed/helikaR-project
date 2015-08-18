var ClassifyModal = React.createClass({

	setText: function (text) {
		document.getElementById("eval").innerHTML = text;
	},

	render: function() {

		var options_list = [];

		this.props.variables.forEach(function (variable) {
			options_list.push(<option value={variable}>{variable}</option>);				
		});

		return (
			<Modal {...this.props} title="Choose data">
				<div className='modal-body'>

					<Input type='select' label='Output column' ref='vars'>
						{options_list}
					</Input>

					<Button onClick={this.evalClick}>Evaluate</Button>

					<div id="eval"></div>

				    <Input type='file' label='File' ref='file' />

				</div>

		        <div className='modal-footer'>
    			    <Button onClick={this.handleClick}>Submit</Button>
        		</div>

			</Modal>
		);
	},

	handleClick: function() {
		this.props.onRequestHide();
		console.log(this.refs.file.getInputDOMNode().files[0]);
		this.props.onClick(this, this.refs.vars.getValue(), this.refs.file.getInputDOMNode().files[0], false);
	},

	evalClick: function() {
		this.props.onClick(this, this.refs.vars.getValue(), null, true);
	}

});