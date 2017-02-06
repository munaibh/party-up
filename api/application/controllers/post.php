<?php
require(APPPATH . 'libraries/REST_Controller.php');

class Post extends REST_Controller {

	private $id;

	function __construct() {
		parent::__construct();
		$this->id = $this->session->userdata('id');
		$this->load->model('post_model');
	}

	public function posts_get() {

		// Getting Variables
		$page = $this->get('page');
		$type = $this->get('type');
		$game = $this->get('game');
		$postid = (int) $this->get('id');
		$region = $this->session->userdata('region');
		$tagname  = $this->get('tag');
		$username = $this->get('user');

		// Passing to database Function.
		$dbres = $this->post_model->getPosts($postid, $this->id, $username, $tagname, $game, $page, $type, $region);
		$this->response($dbres, 200);

	}

	public function posts_post() {

		// Getting Posted Variables
		$dbres = false;
		$time  = date('Y-m-d H:i:s');
		$tags  = $this->post('tags');
		$game  = $this->post('game');
		$players  = $this->post('size');
		$message  = $this->post('message');

		// Passing to database Function.
		if($players != NULL && $message != NULL && $tags != NULL && $game != NULL) {
			$dbres = $this->post_model->addPost($this->id, $message, $time, $tags, $players, $game);
		}

		$this->response([], ($dbres) ? 200 : 401); // 200 OK : 401 Unauthorized

	}


	public function posts_put() {

		// Get Put and Initlise $dbres.
		$dbres  = false;
		$postid = $this->put('id');
		// Pass Variables to the Add Function.
		if($postid != NULL) $dbres = $this->post_model->addInvite($this->id, $postid);
		// Set Response 200 (OK) or 404 (Not Found).
		$this->response([], ($dbres) ? 200 : 401);

	}

	public function posts_delete() {

		// Get Postid and Initliase $dbres.
		$dbres = false;
		$postid = $this->get('id');
		// Pass Variables to the Delete Function.
		if($postid != NULL) $dbres = $this->post_model->deletePost($this->id, $postid);
		// Set Response 204 (No Content) or 404 (Not Found).
		$this->response([], ($dbres) ? 204 : 404);

	}

}
