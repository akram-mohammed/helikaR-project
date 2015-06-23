var DCModal = React.createClass({
	render: function() {

		var options_list = [];
		var wololo="enabled";

		this.props.variables.forEach(function (variable) {
			options_list.push(<option value={variable}>{variable}</option>);				
		});

		return (
			<Modal {...this.props} title="Choose data">
				<div className='modal-body'>
					<Input>	


						<Row>	
							<Col xs={6}>
								<Input type='checkbox' label='Group' ref='bar_chart' />
							</Col>
							<Col xs={6}>
								<Input type='checkbox' label='Group' ref='bubble_chart' />
							</Col>
						</Row>

						<Row>
							<Col xs={6}>
								<Input type='select' label='Variable - X' ref='bar_x' >
									{options_list}
								</Input>
							</Col>
							<Col xs={6}>
								<Input type='select' label='Variable - X' ref='bubble_x' >
									{options_list}
								</Input>
							</Col>
						</Row>

						<Row>
							<Col xs={6}>
								<Input type='select' label='Variable - Y' ref='bar_y' >
									{options_list}
								</Input>
							</Col>
							<Col xs={6}>
								<Input type='select' label='Variable - Y' ref='bubble_y' >
									{options_list}
								</Input>
							</Col>
						</Row>

						<Row>
							<Col xs={6}>
							</Col>
							<Col xs={6}>
								<Input type='select' label='Group' ref='bubble_g' >
									{options_list}
								</Input>
							</Col>
						</Row>												

					</Input>
				</div>
		        <div className='modal-footer'>
    			    <Button onClick={this.handleClick}>Submit</Button>
        		</div>
			</Modal>
		);
	},

	handleClick: function() {


		this.props.onRequestHide();
		this.props.onClick(this, {
			bar: this.refs.bar_chart.getChecked(), 
			bubble: this.refs.bubble_chart.getChecked(), 
			bar_vars: {x: this.refs.bar_x.getValue(), y: this.refs.bar_y.getValue()},
			bubble_vars: {x: this.refs.bubble_x.getValue(), y: this.refs.bubble_y.getValue(), g: this.refs.bubble_g.getValue()}
		});
	}

})