<?php
/**
 * Template Name: Featured video list
 *
 * @package os_media
 * @since OS media 0.1
 * 
 */
?>

<?php get_header(); ?>

<div id="main-content" class="main-content">
  <div id="primary" class="content-area">

    <?php
    $mypost = array( 
      'post_type' => 'osmedia_cpt', 
      'showposts' => 15, 
      'paged' => $paged /*, 'category_name' => Featured */
    );
    $loop = new WP_Query( $mypost );
    ?>

    <div id="featured-content" class="featured-content">
      <div class="featured-content-inner">
          <?php /* The loop */ ?>
          <?php while ( $loop->have_posts() ) : $loop->the_post(); ?>
          
                <?php
                  if (has_post_thumbnail( $post->ID )) {
                    $array_img_cover_url = wp_get_attachment_image_src( get_post_thumbnail_id( $post->ID ), 'single-post-thumbnail' ); 
                    $img_cover_url = $array_img_cover_url[0];
                  }else{    
                    // try load image from video folder
                    $img_cover_url = '';
                    $options = get_option('OSmedia_settings'); 
                    $local_path = $options['OSmedia_path']; // not implemented yet 
                    $url = $options['OSmedia_url'];   

                    $fileurl = get_post_meta($post->ID, 'OSmedia_fileurl', true);
                    $file_img = get_post_meta($post->ID, 'OSmedia_file', true);

                    if ( !$fileurl || $fileurl == '' ) $fileurl = $url;
                    
                    if ( $file_img AND $file_img != '' ) 
                      $img_cover_url = $fileurl . '/' .  $file_img. ".jpg"; 
                  }
                ?>

            <article id="post-<?php the_ID(); ?>" <?php post_class(); ?> >
              <a class="post-thumbnail" href="<?php the_permalink(); ?>">
                <img src="<?php echo $img_cover_url ?>" />
                <img src="<?php echo get_stylesheet_directory_uri() ?>/images/OS-frame-play.png" />
              </a>

              <header class="entry-header">
                <div class="entry-meta">
                  <span class="cat-links"><?php get_the_terms( $post->ID, 'osmedia_tax' ) ?></span>
                
                </div><!-- .entry-meta -->
                <?php //endif; ?>

                <?php the_title( '<h1 class="entry-title"><a href="' . esc_url( get_permalink() ) . '" rel="bookmark">','</a></h1>' ); ?>
                <?php the_excerpt( '<span class="entry_exc">','</span>' ); ?>
                
              </header><!-- .entry-header -->
            </article><!-- #post-## -->
                  
          <?php endwhile ?>
          <?php wp_reset_query(); ?>

      </div><!-- .featured-content-inner -->
    </div><!-- #featured-content .featured-content -->

    <div id="primary" class="content-area" style="margin-top:20px">
      <div id="content" class="site-content" role="main">

        <?php while ( have_posts() ) : the_post(); ?>

          <article>

              <?php the_title( '<header class="entry-header"><h1 class="entry-title">', '</h1></header><!-- .entry-header -->' ); ?>
              
              <div class="entry-content">
                <?php the_content();?>
              </div>
          
          </article>

        <?php endwhile; ?> 

      </div>  
    </div>

  </div><!-- .main-content -->  
</div><!-- .primary -->  

<?php get_sidebar(); ?>
<?php get_footer(); ?>