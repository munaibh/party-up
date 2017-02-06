<?php

class Post_model extends CI_Model {

	function __construct() {
		parent::__construct();
	}

	public function getPosts($postid, $userid, $username, $tags, $game, $page, $type, $region) {

		// Initilize variables.
		$count = 7;
		$where = array();

		$stmnt = "
			SELECT DISTINCT user.*, post.* FROM post
			INNER JOIN user ON user.userid = post.userid
			INNER JOIN userdetail ON user.userid = userdetail.userid
			INNER JOIN posttags ON post.postid = posttags.postid
			JOIN tags ON posttags.tagid = tags.tagid
			WHERE userdetail.region = '{$region}' AND status = 0";

		// Add Dynamic Constraints.
		if($game) {
			$game = urldecode($game);
			$where[] = "post.game = '{$game}'";
		}

		if($tags) $where[] = "tags.name  = '{$tags}'";
		if($postid)  $where[] = "post.postid = {$postid}";
		if($username) $where[] = "user.username = '{$username}'";

		// Filter posts by user not read.
		if($type == "latest")  {
			$substmnt = "SELECT datetime FROM user WHERE userid = {$userid}";
			$datetime = $this->db->query($substmnt)->result_array()[0]['datetime'];
			$where[] = "post.datetime > '{$datetime}'";
		}

		// filter by page using number ($page) and amount ($count).
		$offset  = ($page) ? ($page * $count) - $count : 0;
		$limit = ($page && $type != "latest") ? " ORDER BY post.datetime DESC LIMIT ? OFFSET ?" : "";

		// Convert $where to string seperate by AND.
		$clause = implode(' AND ', $where);
		$stmnt .= ($where) ? " AND " . $clause . $limit : $limit;
		$dbres  = $this->db->query($stmnt, [$count, $offset])->result_array();

		// Update last access date.
		$this->db->where(['userid' => $userid]);
		$this->db->update('user', ['datetime' => date('Y-m-d H:i:s')]);

		return $this->buildPosts($userid, $dbres);

	}

	public function buildPosts($userid, $posts) {

		// Initilize output array.
		$output = [];

		foreach($posts as $post)  {

			// Retrieve poster user details and tag details.
			$stmnt[0] = "
				SELECT user.userid as 'id', user.username, user.avatarurl FROM invite
				INNER JOIN user ON user.userid = invite.userid
				WHERE invite.postid = {$post['postid']} AND invite.status = 1";

			$stmnt[1] = "
				SELECT tags.name FROM posttags
				RIGHT JOIN tags ON posttags.tagid = tags.tagid
				WHERE posttags.postid = {$post['postid']}";

			// Build ouput JSON.
			$output[] = [
				'id' => (int) $post['postid'],
				'text' => $post['message'],
				'game' => $post['game'],
				'date' => $this->time_ago($post['datetime']),
				'flag' => 0,
				'user' => [
					'id'=> (int) $post['userid'],
					'username' => $post['username'],
					'avatar' => $post['avatarurl']
				],
				'host' => ($post['userid'] == $userid) ? true : false,
				'tags' => $this->db->query($stmnt[1])->result_array(),
				'players' => $this->db->query($stmnt[0])->result_array(),
				'size' => (int) $post['players'],
				'complete' => ($post['status'] != 0) ? true : false,
			];

		}

		// return (!empty($output) ? $output : ['status' => false]);
		return $output;

	}

	public function addPost($userid, $message, $time, $tags, $players, $game) {

		// Store post details in array.
		$insert = [
			'game'   => $game,
			'userid' => $userid, 'message' => $message,
			'datetime' => $time, 'players' => $players,
		];

		// Using array add post to database.
		$this->db->insert('post', $insert);
		$lastid = $this->db->insert_id();

		// Add tags to tags table and link to post using $lastid.
		for($i=0; $i < count($tags); $i++) {
			$this->db->insert('posttags', array('postid' => $lastid, 'tagid' => $tags[$i]));
		}

		// If insert is complete return true, else false.
		return ($lastid != 0) ? true : false;

	}

	public function addInvite($userid, $postid) {

		// Retrieve user invite details.
		$stmnt = "SELECT userid, postid FROM post WHERE postid = {$postid}";
		$dbres = $this->db->query($stmnt);

		// If user has not sent invite send invite.
		if($dbres->num_rows() == 1) {
			if($dbres->result_array()[0]['userid'] != $userid) {
				$dbres = $this->db->get_where('invite', ['postid' => $postid, 'userid' => $userid]);
				if($dbres->num_rows() == 0) {
					$this->db->insert('invite', ['postid' => $postid, 'userid' => $userid]);
					return true;
				}
			}
		}

		// On error return false.
		return false;

	}

	public function deletePost($userid, $postid) {

		// Check if Post Exists before deleting.
		$stmnt = "SELECT userid FROM post WHERE postid = {$postid} AND userid = {$userid}";
		$dbres = $this->db->query($stmnt);
		if($dbres->num_rows() == 1) {
			$this->db->delete('post', array('postid' => $postid));
			return true; // Return true when Deleted.
		}

		// Return false if nothing is deleted.
		return false;

	}

	function time_ago($date) {

		if (empty($date)) { return "No date provided"; }
		$periods = array("second", "minute", "hour", "day", "week", "month", "year", "decade");
		$lengths = array("60", "60", "24", "7", "4.35", "12", "10");
		$now = time();

		$unix_date = strtotime($date);
		// check validity of date
		if (empty($unix_date)) return "Bad date";

		// is it future date or past date
		if ($now > $unix_date) {
			$difference = $now - $unix_date;
			$tense = "ago";
		} else {
			$difference = $unix_date - $now;
			$tense = "from now";
		}

		for ($j = 0; $difference >= $lengths[$j] && $j < count($lengths) - 1; $j++) {
				$difference /= $lengths[$j];
		}
		$difference = round($difference);
			if ($difference != 1) {
			$periods[$j].= "s";
		}
		return "$difference $periods[$j] {$tense}";
	}

}
