<?php

class Auth extends CI_Controller {

	private $id;

	function __construct() {
		parent::__construct();
		$this->id = $this->session->userdata('id');
		$this->load->model('auth_model');
	}

	public function status() {
		// Check if user is allowed.
		$sessdata = $this->session->userdata();
		$jsondata = (!empty($sessdata['id'])) ? $sessdata : ['status' => false];
		header('Content-type: application/json');
		echo json_encode($jsondata);
	}

	public function logout() {
		// Check if user is allowed.
		$sessdata = $this->session->sess_destroy();
		header('Content-type: application/json');
		return "Model was Deleted";
	}

	public function signin() {

		// Get posted variables.
		$sessdata = false;
		$username = $this->input->post('username');
		$password = $this->input->post('password');

		// If username and password exist.
		if ($username && $password) {
			// Pass variables to verify user.
			$sessdata = $this->auth_model->checkUser($username, $password);
			if($sessdata) $this->session->set_userdata($sessdata);
		}

		header('Content-type: application/json');
		echo json_encode(($sessdata) ? $sessdata : ['status' => false]);

	}

	public function updateUser() {
		// Get posted variables.
  	$status = false;
		$arr = json_decode(file_get_contents('php://input'), true);

		// If files exists.
		if($arr != NULL) {
			// Pass variables to updatedetails.
			$sessdata = $this->auth_model->updateDetails($this->id, $arr);
			if($sessdata != false) {
				$this->session->set_userdata('psn', $sessdata['psn']);
				$this->session->set_userdata('xbox', $sessdata['xbox']);
				$this->session->set_userdata('interests', $sessdata['games']);
				$status = true;
			}
		}

		header('Content-type: application/json');
		echo json_encode(['status' => $status]);

	}

	public function register() {
		// Get avatar and post data.
    $filedata = $_FILES["avatar"];
		$postdata = $this->input->post();
		// Pass data to add user function.
		$dbres = $this->auth_model->addUser($postdata, $filedata);
		echo json_encode($dbres);
	}


	public function checkExisting() {
		// Get posted username and password and check if it exists.
		$username = $this->input->get('username');
		$dbres = $this->auth_model->existingUser($username);
		echo json_encode($dbres);
	}


}
